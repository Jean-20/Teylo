import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, ChevronDown, Check, Plus, CheckCircle2, ShoppingBag } from 'lucide-react'
import { getAddresses, createAddress } from '../api/profile.js'
import { createOrder } from '../api/orders.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import { formatPrice } from '../utils/formatPrice.js'
import useCartStore from '../store/cartStore.js'
import useAuthStore from '../store/authStore.js'

const IGV_RATE  = 0.18
const SHIPPING_COST = 10
const FREE_SHIPPING = 99

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Envío estándar',  desc: '3-5 días hábiles',  price: 0   },
  { id: 'express',  label: 'Envío express',   desc: '1-2 días hábiles',  price: 9.9 },
]

const PAYMENT_METHODS = [
  { id: 'card',    label: 'Tarjeta de débito / crédito' },
  { id: 'yape',    label: 'Yape'                         },
  { id: 'plin',    label: 'Plin'                         },
]

const EMPTY_ADDR = { street: '', city: '', state: '', postalCode: '', country: 'Peru' }

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, clearCart: storeClearCart } = useCartStore()

  const [addresses, setAddresses]       = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm]         = useState(EMPTY_ADDR)
  const [savingAddr, setSavingAddr]     = useState(false)

  const [shipping, setShipping]   = useState('standard')
  const [payment, setPayment]     = useState('card')
  const [openPayment, setOpenPayment] = useState('card')

  const [placing, setPlacing]     = useState(false)
  const [error, setError]         = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors]       = useState({})

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (items.length === 0) { navigate('/carrito'); return }
    getAddresses().then(({ data }) => {
      const addrs = data.data
      setAddresses(addrs)
      const primary = addrs.find((a) => a.isPrimary) || addrs[0]
      if (primary) setSelectedAddr(primary.id)
    })
  }, [isAuthenticated, navigate, items])

  const subtotal     = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shippingFee  = subtotal >= FREE_SHIPPING ? 0 : (shipping === 'express' ? SHIPPING_COST + 9.9 : SHIPPING_COST)
  const igv          = subtotal * IGV_RATE
  const total        = subtotal + shippingFee + igv

  const handleSaveAddress = async () => {
    if (!addrForm.street || !addrForm.city) return
    setSavingAddr(true)
    try {
      const { data } = await createAddress(addrForm)
      const newAddr = data.data
      setAddresses((prev) => [...prev, newAddr])
      setSelectedAddr(newAddr.id)
      setShowAddrForm(false)
      setAddrForm(EMPTY_ADDR)
    } catch { } finally { setSavingAddr(false) }
  }

  const handleConfirm = async () => {
    const newErrors = {}
    if (!selectedAddr)                        newErrors.addr    = 'Debes seleccionar una dirección de envío.'
    if (!shipping)                            newErrors.ship    = 'Debes seleccionar un método de envío.'
    if (!payment)                             newErrors.pay     = 'Debes seleccionar un método de pago.'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    setError('')
    setPlacing(true)
    try {
      await createOrder(selectedAddr)
      storeClearCart()
      setConfirmed(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al confirmar el pedido.')
    } finally { setPlacing(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* ── Modal de confirmación ────────────────────────────── */}
      {confirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInScale">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-carbon mb-2">¡Pago confirmado!</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Tu pedido fue recibido con éxito.<br />Puedes rastrearlo desde tu perfil.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/perfil?tab=pedidos')}
                className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Ver mis pedidos
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-soft text-gray-carbon py-2.5 rounded-xl text-sm font-medium hover:bg-gray-soft transition"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-carbon mb-8">Finalizar compra</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Formularios ──────────────────────────────────────── */}
        <div className="flex-1 space-y-6">

          {/* 1. Dirección */}
          <section className={`border rounded-xl p-5 transition ${errors.addr ? 'border-red-400' : 'border-gray-soft'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-gray-carbon">Dirección de envío <span className="text-red-500">*</span></h2>
              </div>
              {errors.addr && <span className="text-xs text-red-500">{errors.addr}</span>}
            </div>

            {addresses.length > 0 && (
              <div className="space-y-2 mb-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex gap-3 border rounded-lg p-3 cursor-pointer transition
                      ${selectedAddr === addr.id ? 'border-primary bg-primary/5' : 'border-gray-soft'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddr === addr.id}
                      onChange={() => setSelectedAddr(addr.id)}
                      className="accent-primary mt-0.5"
                    />
                    <div className="text-sm text-gray-carbon">
                      <p className="font-medium">{addr.street}</p>
                      <p className="text-gray-400">{addr.city}, {addr.state} {addr.postalCode && `· ${addr.postalCode}`}</p>
                    </div>
                    {addr.isPrimary && <span className="ml-auto text-xs text-primary font-medium self-center">Principal</span>}
                  </label>
                ))}
              </div>
            )}

            {!showAddrForm ? (
              <button
                onClick={() => setShowAddrForm(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar nueva dirección
              </button>
            ) : (
              <div className="border border-gray-soft rounded-lg p-4 space-y-3 mt-2">
                <input
                  placeholder="Calle y número *"
                  value={addrForm.street}
                  onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
                  className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Ciudad *"
                    value={addrForm.city}
                    onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                    className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Departamento"
                    value={addrForm.state}
                    onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                    className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Código postal"
                    value={addrForm.postalCode}
                    onChange={(e) => setAddrForm((f) => ({ ...f, postalCode: e.target.value }))}
                    className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    placeholder="País"
                    value={addrForm.country}
                    onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))}
                    className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddr}
                    className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                  >
                    {savingAddr ? 'Guardando...' : 'Guardar dirección'}
                  </button>
                  <button
                    onClick={() => { setShowAddrForm(false); setAddrForm(EMPTY_ADDR) }}
                    className="text-sm text-gray-400 hover:text-gray-carbon px-4 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 2. Método de envío */}
          <section className={`border rounded-xl p-5 transition ${errors.ship ? 'border-red-400' : 'border-gray-soft'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-gray-carbon">Método de envío <span className="text-red-500">*</span></h2>
              </div>
              {errors.ship && <span className="text-xs text-red-500">{errors.ship}</span>}
            </div>
            <div className="space-y-2">
              {SHIPPING_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition
                    ${shipping === m.id ? 'border-primary bg-primary/5' : 'border-gray-soft'}`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === m.id}
                    onChange={() => setShipping(m.id)}
                    className="accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-carbon">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-carbon">
                    {m.price === 0 ? 'Gratis' : formatPrice(m.price)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* 3. Método de pago */}
          <section className={`border rounded-xl overflow-hidden transition ${errors.pay ? 'border-red-400' : 'border-gray-soft'}`}>
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-gray-carbon">Método de pago <span className="text-red-500">*</span></h2>
              </div>
              {errors.pay && <span className="text-xs text-red-500">{errors.pay}</span>}
            </div>
            {PAYMENT_METHODS.map((m, i) => (
              <div key={m.id} className={`border-t border-gray-soft ${i === 0 ? 'border-t-0' : ''}`}>
                <button
                  onClick={() => { setPayment(m.id); setOpenPayment(openPayment === m.id ? '' : m.id) }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-soft/40 transition"
                >
                  <input type="radio" checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-primary" readOnly />
                  <span className="text-sm font-medium text-gray-carbon flex-1 text-left">{m.label}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition ${openPayment === m.id ? 'rotate-180' : ''}`} />
                </button>
                {openPayment === m.id && (
                  <div className="px-5 pb-4">
                    {m.id === 'card' ? (
                      <div className="space-y-3">
                        <input placeholder="Número de tarjeta" className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="MM/AA" className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                          <input placeholder="CVV" className="border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <input placeholder="Nombre en la tarjeta" className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Escanea el QR o ingresa tu número de teléfono al confirmar.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* ── Resumen ──────────────────────────────────────────── */}
        <div className="lg:w-72 shrink-0">
          <div className="border border-gray-soft rounded-xl p-5 sticky top-6">
            <h2 className="font-bold text-gray-carbon mb-4">Tu pedido</h2>

            <div className="space-y-2.5 mb-4 max-h-56 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2.5 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-gray-soft overflow-hidden shrink-0">
                    <img
                      src={getImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-carbon truncate text-xs">{item.product.name}</p>
                    <p className="text-gray-400 text-xs">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-carbon shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-soft pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-carbon">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-carbon">
                <span>Envío</span>
                <span>{shippingFee === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>IGV (18%)</span><span>{formatPrice(igv)}</span>
              </div>
              <div className="border-t border-gray-soft pt-2 flex justify-between font-bold text-gray-carbon">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleConfirm}
              disabled={placing}
              className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {placing ? 'Procesando...' : (
                <><Check className="w-4 h-4" /> Confirmar Pedido</>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 mt-2">Pago simulado — no se realizará ningún cobro real.</p>

            <button
              onClick={() => navigate('/carrito')}
              className="mt-3 w-full text-sm text-gray-400 hover:text-gray-carbon py-2 transition text-center"
            >
              Cancelar y volver al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
