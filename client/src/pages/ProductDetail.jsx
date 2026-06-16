import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, ChevronRight, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { getProductBySlug } from '../api/products.js'
import { addToCart } from '../api/cart.js'
import { toggleWishlist } from '../api/wishlist.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import { formatPrice } from '../utils/formatPrice.js'
import useAuthStore from '../store/authStore.js'
import useCartStore from '../store/cartStore.js'
import useWishlistStore from '../store/wishlistStore.js'
import ProductCard from '../components/ui/ProductCard.jsx'

const SWATCHES = ['#9333EA', '#1a1a1a', '#4f7bbd', '#e07b54']

function Stars({ value, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <span className="flex">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </span>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { incrementCount } = useCartStore()
  const { isWishlisted, toggle } = useWishlistStore()

  const [product, setProduct]   = useState(null)
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeImage, setActiveImage] = useState(null)
  const [qty, setQty]           = useState(1)
  const [tab, setTab]           = useState('descripcion')
  const [addingCart, setAddingCart] = useState(false)
  const [cartMsg, setCartMsg]   = useState('')

  useEffect(() => {
    setLoading(true)
    getProductBySlug(slug)
      .then(({ data }) => {
        setProduct(data.data)
        setRelated(data.data.related || [])
        setActiveImage(data.data.imageUrl)
        setQty(1)
        setTab('descripcion')
      })
      .catch(() => navigate('/categorias'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  const wishlisted = product ? isWishlisted(product.id) : false

  const handleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login')
    toggle(product.id)
    try { await toggleWishlist(product.id) }
    catch { toggle(product.id) }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate('/login')
    setAddingCart(true)
    try {
      await addToCart(product.id, qty)
      incrementCount()
      setCartMsg('¡Agregado al carrito!')
      setTimeout(() => setCartMsg(''), 2500)
    } catch (err) {
      setCartMsg(err?.response?.data?.error || 'Error al agregar')
      setTimeout(() => setCartMsg(''), 2500)
    } finally {
      setAddingCart(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
        <div className="flex gap-10">
          <div className="w-1/2 aspect-square bg-gray-soft rounded-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-soft rounded w-1/3" />
            <div className="h-8 bg-gray-soft rounded w-2/3" />
            <div className="h-6 bg-gray-soft rounded w-1/4" />
            <div className="h-20 bg-gray-soft rounded" />
          </div>
        </div>
      </div>
    )
  }
  if (!product) return null

  const allImages = [product.imageUrl, ...(product.images?.map((i) => i.url) || [])]
  const avgRating = product.avgRating ?? 0
  const reviewCount = product.reviewCount ?? 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-primary">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/categorias" className="hover:text-primary">Catálogo</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/categorias?category=${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-carbon truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        {/* ── Galería ─────────────────────────────────────────── */}
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-2xl bg-gray-soft overflow-hidden mb-3">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition
                    ${activeImage === img ? 'border-primary' : 'border-gray-soft'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ────────────────────────────────────────────── */}
        <div className="lg:w-1/2 flex flex-col">
          {/* Label */}
          {product.label && (
            <span className="self-start text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-3">
              {product.label}
            </span>
          )}

          <h1 className="text-3xl font-bold text-gray-carbon leading-tight mb-2">{product.name}</h1>

          {/* Stars + reviews */}
          <div className="flex items-center gap-2 mb-4">
            <Stars value={avgRating} />
            <span className="text-sm text-gray-400">
              {avgRating > 0 ? `${avgRating.toFixed(1)} · ${reviewCount} opinión${reviewCount !== 1 ? 'es' : ''}` : 'Sin opiniones'}
            </span>
            {product.brand && <span className="text-xs text-gray-400 ml-1">· {product.brand.name}</span>}
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-extrabold text-gray-carbon">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
            {product.originalPrice && (
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Swatches decorativos */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-gray-400 mr-1">Color:</span>
            {SWATCHES.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-110 transition"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Cantidad */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-gray-carbon">Cantidad:</span>
            <div className="flex items-center border border-gray-soft rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-carbon hover:bg-gray-soft transition font-bold"
              >−</button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-carbon hover:bg-gray-soft transition font-bold"
              >+</button>
            </div>
            <span className="text-xs text-gray-400">{product.stock} disponibles</span>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-60"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition
                ${wishlisted ? 'border-primary bg-primary/10' : 'border-gray-soft hover:border-primary'}`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-primary text-primary' : 'text-gray-carbon'}`} />
            </button>
          </div>

          {cartMsg && (
            <p className={`text-sm text-center py-2 rounded-lg ${cartMsg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              {cartMsg}
            </p>
          )}

          {/* Info badges */}
          <div className="mt-5 space-y-2.5 text-sm text-gray-carbon">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Envío gratis en pedidos mayores a <strong>S/. 99</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Compra 100% segura y protegida</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span>Devoluciones dentro de los 30 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="flex border-b border-gray-soft mb-6">
          {['descripcion','especificaciones','opiniones'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px
                ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-carbon'}`}
            >
              {t === 'descripcion' ? 'Descripción' : t === 'especificaciones' ? 'Especificaciones' : 'Opiniones'}
            </button>
          ))}
        </div>

        {tab === 'descripcion' && (
          <p className="text-gray-carbon leading-relaxed max-w-3xl">{product.description || 'Sin descripción disponible.'}</p>
        )}

        {tab === 'especificaciones' && (
          <div className="max-w-lg divide-y divide-gray-soft">
            {[
              { label: 'Marca',       value: product.brand?.name      },
              { label: 'Categoría',   value: product.category?.name   },
              { label: 'Stock',       value: `${product.stock} unidades` },
              { label: 'Disponible',  value: product.stock > 0 ? 'Sí' : 'No' },
            ].map((row) => row.value && (
              <div key={row.label} className="flex py-3 text-sm">
                <span className="w-36 text-gray-400 shrink-0">{row.label}</span>
                <span className="text-gray-carbon font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'opiniones' && (
          <div className="max-w-2xl space-y-5">
            {reviewCount === 0 ? (
              <p className="text-gray-400 text-sm">Todavía no hay opiniones para este producto.</p>
            ) : (
              product.reviews?.map((r) => (
                <div key={r.id} className="border border-gray-soft rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {r.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-semibold text-gray-carbon">{r.user?.name || 'Usuario'}</span>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm text-gray-carbon leading-relaxed">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString('es-PE')}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Relacionados ─────────────────────────────────────── */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-carbon mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
