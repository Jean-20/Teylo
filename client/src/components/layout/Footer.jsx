import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-white-paper border-t border-gray-soft mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1 — Marca */}
          <div>
            <span className="text-primary font-bold text-lg">Teylo</span>
            <p className="text-sm text-gray-carbon mt-3 leading-relaxed">
              Inspirando la creatividad diaria a través de objetos hermosos y funcionales.
            </p>
            <div className="flex gap-3 mt-5">
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full border border-gray-soft flex items-center justify-center text-gray-carbon hover:text-primary hover:border-primary transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              {/* Share */}
              <a href="#" className="w-8 h-8 rounded-full border border-gray-soft flex items-center justify-center text-gray-carbon hover:text-primary hover:border-primary transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Explorar */}
          <div>
            <h4 className="font-semibold text-gray-carbon mb-4 text-sm">Explorar</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/productos" className="text-sm text-gray-carbon hover:text-primary transition">
                  Productos
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-carbon hover:text-primary transition">
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 — Ayuda */}
          <div>
            <h4 className="font-semibold text-gray-carbon mb-4 text-sm">Ayuda</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-gray-carbon hover:text-primary transition">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-carbon hover:text-primary transition">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-carbon hover:text-primary transition">
                  Términos
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-carbon mb-4 text-sm">Newsletter</h4>
            <p className="text-xs text-gray-carbon mb-3 leading-relaxed">
              Recibe inspiración y novedades en tu correo.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail('') }}
              className="flex"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo"
                className="flex-1 px-3 py-2 border border-gray-soft rounded-l text-sm focus:outline-none focus:border-primary transition min-w-0"
              />
              <button
                type="submit"
                className="bg-primary text-white px-3 rounded-r hover:bg-purple-700 transition shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-soft mt-10 pt-6 text-center text-xs text-gray-400">
          © 2024 Teylo. Creatividad en cada trazo.
        </div>
      </div>
    </footer>
  )
}
