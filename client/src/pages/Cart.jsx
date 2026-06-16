import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Tag } from 'lucide-react'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cart.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import { formatPrice } from '../utils/formatPrice.js'
import useCartStore from '../store/cartStore.js'
import useAuthStore from '../store/authStore.js'

const IGV_RATE = 0.18
const FREE_SHIPPING_MIN = 99
const SHIPPING_COST = 10

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { setItems } = useCartStore()
  const [items, setLocalItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    getCart()
      .then(({ data }) => {
        const cartItems = data.data
        setLocalItems(cartItems)
        setItems(cartItems)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate, setItems])

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    setLocalItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i))
    try {
      await updateCartItem(item.id, newQty)
      setItems(items.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i))
    } catch {
      setLocalItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: item.quantity } : i))
    }
  }

  const handleRemove = async (itemId) => {
    const prev = [...items]
    const next = items.filter((i) => i.id !== itemId)
    setLocalItems(next)
    setItems(next)
    try { await removeCartItem(itemId) }
    catch { setLocalItems(prev); setItems(prev) }
  }

  const handleClear = async () => {
    if (!window.confirm('¿Vaciar todo el carrito?')) return
    const prev = [...items]
    setLocalItems([])
    setItems([])
    try { await clearCart() }
    catch { setLocalItems(prev); setItems(prev) }
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const shipping  = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST
  const igv       = subtotal * IGV_RATE
  const total     = subtotal + shipping

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-8 bg-gray-soft rounded w-48 mb-8" />
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-soft rounded-xl" />)}
          </div>
          <div className="w-72 h-64 bg-gray-soft rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-carbon mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-6">Descubre nuestros productos y agrega los que más te gusten.</p>
        <Link to="/categorias" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-purple-700 transition">
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-carbon">Carrito de compras</h1>
        <button onClick={handleClear} className="text-sm text-gray-400 hover:text-red-500 transition">
          Vaciar carrito
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Lista ────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border border-gray-soft rounded-xl p-4">
              <Link to={`/productos/${item.product.slug}`} className="shrink-0">
                <div className="w-20 h-20 rounded-lg bg-gray-soft overflow-hidden">
                  <img
                    src={getImageUrl(item.product.imageUrl)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/productos/${item.product.slug}`}>
                  <p className="font-semibold text-gray-carbon hover:text-primary transition truncate">{item.product.name}</p>
                </Link>
                {item.product.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.product.description}</p>
                )}
                <p className="text-sm font-bold text-gray-carbon mt-1">{formatPrice(item.product.price)}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center border border-gray-soft rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQtyChange(item, -1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-carbon hover:bg-gray-soft transition font-bold text-sm"
                  >−</button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item, 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-carbon hover:bg-gray-soft transition font-bold text-sm"
                  >+</button>
                </div>

                <p className="text-sm font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Resumen ──────────────────────────────────────────── */}
        <div className="lg:w-72 shrink-0">
          <div className="border border-gray-soft rounded-xl p-5 sticky top-6">
            <h2 className="font-bold text-gray-carbon mb-5">Resumen del pedido</h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-carbon">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-carbon">
                <span>Envío</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">Gratis</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>IGV (18%)</span>
                <span>{formatPrice(igv)}</span>
              </div>
              <div className="border-t border-gray-soft pt-3 flex justify-between font-bold text-gray-carbon text-base">
                <span>Total</span>
                <span>{formatPrice(total + igv)}</span>
              </div>
            </div>

            {subtotal < FREE_SHIPPING_MIN && (
              <p className="text-xs text-gray-400 mb-4 bg-gray-soft rounded-lg px-3 py-2">
                Agrega <strong>{formatPrice(FREE_SHIPPING_MIN - subtotal)}</strong> más para envío gratis.
              </p>
            )}

            {/* Código descuento (UI only) */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Código descuento"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs border border-gray-soft rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <button className="text-xs font-semibold px-3 border border-gray-soft rounded-lg hover:border-primary hover:text-primary transition">
                Aplicar
              </button>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-sm"
            >
              PROCEDER AL PAGO
            </button>

            <Link to="/categorias" className="block text-center text-xs text-gray-400 hover:text-primary mt-3 transition">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
