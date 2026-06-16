import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  User, Package, MapPin, Settings, LogOut,
  ChevronRight, Plus, Pencil, Trash2, Check, X,
} from 'lucide-react'
import { getProfile, updateProfile, changePassword, getAddresses, createAddress, updateAddress, deleteAddress } from '../api/profile.js'
import { getOrders } from '../api/orders.js'
import { formatPrice } from '../utils/formatPrice.js'
import useAuthStore from '../store/authStore.js'
import useCartStore from '../store/cartStore.js'
import useWishlistStore from '../store/wishlistStore.js'

const STATUS_LABEL = {
  PENDING:   { text: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700' },
  PAID:      { text: 'Pagado',      cls: 'bg-blue-100 text-blue-700'     },
  SHIPPED:   { text: 'En camino',   cls: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { text: 'Entregado',   cls: 'bg-green-100 text-green-700'   },
  CANCELLED: { text: 'Cancelado',   cls: 'bg-red-100 text-red-600'       },
}

const TABS = [
  { id: 'resumen',   label: 'Resumen',       icon: User    },
  { id: 'pedidos',   label: 'Mis pedidos',   icon: Package },
  { id: 'direcciones', label: 'Direcciones', icon: MapPin  },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
]

const EMPTY_ADDR = { street: '', city: '', state: '', postalCode: '', country: 'Peru', isPrimary: false }

export default function Profile() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const { clearCart } = useCartStore()
  const { clear: clearWishlist } = useWishlistStore()

  const activeTab = searchParams.get('tab') || 'resumen'
  const setTab = (t) => setSearchParams({ tab: t })

  const [profile, setProfile]     = useState(null)
  const [orders, setOrders]       = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading]     = useState(true)

  // Config tab state
  const [nameForm, setNameForm]   = useState({ name: '' })
  const [passForm, setPassForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [nameMsg, setNameMsg]     = useState('')
  const [passMsg, setPassMsg]     = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  // Addresses state
  const [editingAddr, setEditingAddr] = useState(null)
  const [addrForm, setAddrForm]       = useState(EMPTY_ADDR)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [savingAddr, setSavingAddr]   = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    Promise.all([getProfile(), getOrders(), getAddresses()])
      .then(([p, o, a]) => {
        setProfile(p.data.data)
        setNameForm({ name: p.data.data.name })
        setOrders(o.data.data)
        setAddresses(a.data.data)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    clearCart()
    clearWishlist()
    navigate('/')
  }

  const handleSaveName = async () => {
    if (!nameForm.name.trim()) return
    setSavingName(true)
    try {
      const { data } = await updateProfile({ name: nameForm.name })
      setProfile(data.data)
      setUser(data.data)
      setNameMsg('Nombre actualizado.')
    } catch { setNameMsg('Error al guardar.') }
    finally { setSavingName(false); setTimeout(() => setNameMsg(''), 3000) }
  }

  const handleSavePass = async () => {
    if (passForm.newPassword !== passForm.confirm) { setPassMsg('Las contraseñas no coinciden.'); return }
    setSavingPass(true)
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassMsg('Contraseña actualizada.')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPassMsg(err?.response?.data?.error || 'Error al cambiar contraseña.')
    } finally { setSavingPass(false); setTimeout(() => setPassMsg(''), 3000) }
  }

  const startEditAddr = (addr) => {
    setEditingAddr(addr.id)
    setAddrForm({ street: addr.street, city: addr.city, state: addr.state || '', postalCode: addr.postalCode || '', country: addr.country || 'Peru', isPrimary: addr.isPrimary })
    setShowAddrForm(false)
  }

  const handleSaveAddr = async () => {
    setSavingAddr(true)
    try {
      if (editingAddr) {
        const { data } = await updateAddress(editingAddr, addrForm)
        setAddresses((prev) => prev.map((a) => {
          if (addrForm.isPrimary) return a.id === editingAddr ? data.data : { ...a, isPrimary: false }
          return a.id === editingAddr ? data.data : a
        }))
        setEditingAddr(null)
      } else {
        const { data } = await createAddress(addrForm)
        if (addrForm.isPrimary) {
          setAddresses((prev) => [...prev.map((a) => ({ ...a, isPrimary: false })), data.data])
        } else {
          setAddresses((prev) => [...prev, data.data])
        }
        setShowAddrForm(false)
      }
      setAddrForm(EMPTY_ADDR)
    } catch { } finally { setSavingAddr(false) }
  }

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return
    await deleteAddress(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const primaryAddr = addresses.find((a) => a.isPrimary) || addresses[0]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse flex gap-8">
        <div className="w-52 shrink-0 space-y-3">
          <div className="h-24 bg-gray-soft rounded-xl" />
          <div className="h-8 bg-gray-soft rounded" />
          <div className="h-8 bg-gray-soft rounded" />
        </div>
        <div className="flex-1 h-80 bg-gray-soft rounded-xl" />
      </div>
    )
  }

  // ── Address form UI ──────────────────────────────────────────
  const AddrForm = ({ onCancel }) => (
    <div className="border border-gray-soft rounded-xl p-4 space-y-3">
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
      <label className="flex items-center gap-2 text-sm text-gray-carbon cursor-pointer">
        <input
          type="checkbox"
          checked={addrForm.isPrimary}
          onChange={(e) => setAddrForm((f) => ({ ...f, isPrimary: e.target.checked }))}
          className="accent-primary"
        />
        Usar como dirección principal
      </label>
      <div className="flex gap-2">
        <button
          onClick={handleSaveAddr}
          disabled={savingAddr || !addrForm.street || !addrForm.city}
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />{savingAddr ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={() => { onCancel(); setAddrForm(EMPTY_ADDR) }}
          className="text-sm text-gray-400 hover:text-gray-carbon flex items-center gap-1.5 px-3"
        >
          <X className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white border border-gray-soft rounded-xl p-5 text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-3">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="font-semibold text-gray-carbon text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
          </div>

          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition
                  ${activeTab === id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-carbon hover:bg-gray-soft'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition mt-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </nav>
        </aside>

        {/* ── Contenido ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-carbon">¡Hola, {profile?.name?.split(' ')[0]}!</h2>

              {/* Últimos pedidos */}
              <div className="border border-gray-soft rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-carbon">Últimos pedidos</h3>
                  <button onClick={() => setTab('pedidos')} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-400">Aún no tienes pedidos.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => {
                      const st = STATUS_LABEL[o.status] || { text: o.status, cls: 'bg-gray-100 text-gray-600' }
                      return (
                        <div key={o.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-carbon font-medium">Pedido #{o.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('es-PE')} · {o.items?.length ?? 0} artículo{(o.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.text}</span>
                            <p className="text-xs text-gray-carbon font-semibold mt-1">{formatPrice(o.total)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Dirección principal */}
              <div className="border border-gray-soft rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-carbon">Dirección principal</h3>
                  <button onClick={() => setTab('direcciones')} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    Gestionar <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {primaryAddr ? (
                  <div className="text-sm text-gray-carbon">
                    <p className="font-medium">{primaryAddr.street}</p>
                    <p className="text-gray-400">{primaryAddr.city}{primaryAddr.state ? `, ${primaryAddr.state}` : ''}</p>
                  </div>
                ) : (
                  <button onClick={() => setTab('direcciones')} className="text-sm text-primary hover:underline">
                    + Agregar dirección
                  </button>
                )}
              </div>

              {/* Banner soporte */}
              <div className="bg-gradient-to-r from-primary to-purple-400 rounded-xl p-5 text-white">
                <p className="font-semibold mb-1">¿Necesitas ayuda?</p>
                <p className="text-sm opacity-90 mb-3">Nuestro equipo está disponible para asistirte.</p>
                <button onClick={() => setTab('configuracion')} className="text-xs bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-lg font-medium">
                  Ir a configuración
                </button>
              </div>
            </div>
          )}

          {/* PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-carbon mb-6">Mis pedidos</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aún no tienes pedidos.</p>
                  <Link to="/categorias" className="mt-4 inline-block text-primary text-sm underline">
                    Ir al catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const st = STATUS_LABEL[o.status] || { text: o.status, cls: 'bg-gray-100 text-gray-600' }
                    return (
                      <div key={o.id} className="border border-gray-soft rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-carbon">Pedido #{o.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${st.cls}`}>{st.text}</span>
                        </div>
                        {o.items && o.items.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {o.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-gray-carbon">
                                <span className="truncate flex-1 pr-2">{item.product?.name || 'Producto'} <span className="text-gray-400">×{item.quantity}</span></span>
                                <span className="font-medium shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="border-t border-gray-soft pt-3 flex justify-between">
                          <span className="text-sm text-gray-400">Total del pedido</span>
                          <span className="font-bold text-gray-carbon">{formatPrice(o.total)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* DIRECCIONES */}
          {activeTab === 'direcciones' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-carbon">Direcciones</h2>
                <button
                  onClick={() => { setShowAddrForm(true); setEditingAddr(null); setAddrForm(EMPTY_ADDR) }}
                  className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva dirección
                </button>
              </div>

              {showAddrForm && !editingAddr && (
                <div className="mb-4">
                  <AddrForm onCancel={() => setShowAddrForm(false)} />
                </div>
              )}

              {addresses.length === 0 && !showAddrForm ? (
                <div className="text-center py-16 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tienes direcciones guardadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id}>
                      {editingAddr === addr.id ? (
                        <AddrForm onCancel={() => setEditingAddr(null)} />
                      ) : (
                        <div className={`border rounded-xl p-4 ${addr.isPrimary ? 'border-primary' : 'border-gray-soft'}`}>
                          <div className="flex items-start justify-between">
                            <div className="text-sm text-gray-carbon">
                              <p className="font-medium">{addr.street}</p>
                              <p className="text-gray-400">{addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}</p>
                              <p className="text-gray-400">{addr.country}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              {addr.isPrimary && <span className="text-xs text-primary font-semibold">Principal</span>}
                              <button onClick={() => startEditAddr(addr)} className="text-gray-400 hover:text-primary transition p-1">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteAddr(addr.id)} className="text-gray-400 hover:text-red-500 transition p-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONFIGURACIÓN */}
          {activeTab === 'configuracion' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-carbon">Configuración</h2>

              {/* Nombre */}
              <div className="border border-gray-soft rounded-xl p-5">
                <h3 className="font-semibold text-gray-carbon mb-4">Información personal</h3>
                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Nombre completo</label>
                    <input
                      value={nameForm.name}
                      onChange={(e) => setNameForm({ name: e.target.value })}
                      className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Correo electrónico</label>
                    <input
                      value={profile?.email || ''}
                      disabled
                      className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm bg-gray-soft/40 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  {nameMsg && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${nameMsg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {nameMsg}
                    </p>
                  )}
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="text-sm bg-primary text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                  >
                    {savingName ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              <div className="border border-gray-soft rounded-xl p-5">
                <h3 className="font-semibold text-gray-carbon mb-4">Cambiar contraseña</h3>
                <div className="space-y-3 max-w-sm">
                  {[
                    { key: 'currentPassword', label: 'Contraseña actual' },
                    { key: 'newPassword',     label: 'Nueva contraseña'  },
                    { key: 'confirm',         label: 'Confirmar nueva contraseña' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 block mb-1">{label}</label>
                      <input
                        type="password"
                        value={passForm[key]}
                        onChange={(e) => setPassForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  {passMsg && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${passMsg.includes('Error') || passMsg.includes('no') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {passMsg}
                    </p>
                  )}
                  <button
                    onClick={handleSavePass}
                    disabled={savingPass || !passForm.currentPassword || !passForm.newPassword}
                    className="text-sm bg-primary text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                  >
                    {savingPass ? 'Actualizando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
