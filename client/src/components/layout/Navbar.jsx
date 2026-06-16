import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User } from 'lucide-react'
import useAuthStore from '../../store/authStore.js'
import useCartStore from '../../store/cartStore.js'

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/categorias', label: 'Categorías' },
  { to: '/productos', label: 'Productos' },
  { to: '/perfil', label: 'Perfil' },
]

export default function Navbar() {
  const [query, setQuery] = useState('')
  const { isAuthenticated } = useAuthStore()
  const { itemCount } = useCartStore()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-soft">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="text-primary font-bold text-xl shrink-0">
          Teylo
        </Link>

        {/* Links de navegación */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors pb-0.5 ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-carbon hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Derecha: búsqueda + carrito + usuario */}
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center">
            <div className="flex items-center border border-gray-soft rounded-full px-3 py-1.5 gap-2 bg-white hover:border-primary transition focus-within:border-primary">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="text-sm bg-transparent outline-none w-36 text-gray-carbon placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Carrito */}
          <Link to="/carrito" className="relative p-2 text-gray-carbon hover:text-primary transition">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* Usuario */}
          <Link
            to={isAuthenticated ? '/perfil' : '/login'}
            className="p-2 text-gray-carbon hover:text-primary transition"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </header>
  )
}
