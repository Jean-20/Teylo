import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, BookOpen, ShoppingBag } from 'lucide-react'
import { getCategories } from '../api/categories.js'
import { getFeaturedProducts } from '../api/products.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import ProductCard from '../components/ui/ProductCard.jsx'

const CAT_ORDER = ['cuadernos', 'boligrafos', 'arte', 'organizacion']

// Banner de picsum — siempre carga, sin dependencias locales
const HERO_IMG  = 'https://picsum.photos/seed/teylo-hero/1200/700'
const OFERTA_IMG = 'https://picsum.photos/seed/teylo-oferta/600/400'

export default function Home() {
  const [categories, setCategories]           = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading]                 = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    Promise.all([getCategories(), getFeaturedProducts()])
      .then(([catRes, featRes]) => {
        const parents = catRes.data.data.filter((c) => !c.parentId)
        const sorted  = CAT_ORDER.map((slug) => parents.find((c) => c.slug === slug)).filter(Boolean)
        setCategories(sorted)
        setFeaturedProducts(featRes.data.data || [])
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setLoadingFeatured(false) })
  }, [])

  return (
    <div className="bg-white-paper">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

          {/* Izquierda — imagen + texto */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[380px] flex flex-col justify-end p-10 bg-gray-900"
            style={{
              backgroundImage: `url(${HERO_IMG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white leading-tight mb-3">
                Creatividad en<br />cada trazo.
              </h1>
              <p className="text-white/80 text-sm mb-6 max-w-xs">
                Descubre la colección más exclusiva de suministros para inspirar tus mejores ideas.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/categorias"
                  className="bg-primary text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-purple-700 transition"
                >
                  Explorar Ahora
                </Link>
                <Link
                  to="/productos?sort=recent"
                  className="border border-white text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-white/10 transition"
                >
                  Nuevos Ingresos
                </Link>
              </div>
            </div>
          </div>

          {/* Derecha — dos cards apiladas */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-primary rounded-2xl p-8 flex flex-col justify-between min-h-[170px] relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <Truck className="w-24 h-24 text-white" />
              </div>
              <Truck className="w-7 h-7 text-white mb-3" />
              <div>
                <h3 className="text-white font-bold text-xl leading-tight">Envío Gratis</h3>
                <p className="text-white/70 text-xs mt-1">En compras mayores a S/99</p>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-soft flex flex-col justify-between min-h-[170px] relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <BookOpen className="w-24 h-24 text-primary" />
              </div>
              <BookOpen className="w-7 h-7 text-primary mb-3" />
              <div>
                <h3 className="text-gray-carbon font-bold text-xl leading-tight">Inspiración Semanal</h3>
                <p className="text-gray-400 text-xs mt-1">Suscríbete a nuestro blog creativo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Explora por Categoría ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-carbon">Explora por Categoría</h2>
            <p className="text-sm text-gray-400 mt-1">Todo lo que necesitas para tu oficina o estudio</p>
          </div>
          <Link to="/categorias" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-soft mb-3" />
                <div className="h-3 bg-gray-soft rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/categorias?category=${cat.slug}`} className="group text-center">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-soft mb-3">
                  {cat.imageUrl ? (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                      <ShoppingBag className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-carbon group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Productos Destacados ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-carbon">Productos Destacados</h2>
            <p className="text-sm text-gray-400 mt-1">Lo más amado por nuestra comunidad</p>
          </div>
          <Link to="/productos" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-soft overflow-hidden">
                <div className="aspect-[4/3] bg-gray-soft" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-soft rounded w-3/4" />
                  <div className="h-3 bg-gray-soft rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay productos destacados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner Oferta Especial ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-6 pb-14">
        <div className="bg-gray-soft rounded-2xl overflow-hidden flex flex-col md:flex-row items-center">
          <div className="flex-1 p-10 md:p-12">
            <span className="inline-block bg-primary text-white text-xs font-medium px-3 py-1 rounded-full mb-5">
              Oferta Especial
            </span>
            <h2 className="text-4xl font-bold text-gray-carbon leading-tight mb-4">
              Dale color a<br />tus notas.
            </h2>
            <p className="text-sm text-gray-carbon/80 mb-7 max-w-sm leading-relaxed">
              Obtén un 20% de descuento en toda la colección de resaltadores y plumones durante este mes.
            </p>
            <Link
              to="/categorias?category=arte"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-purple-700 transition"
            >
              Comprar Ahora
            </Link>
          </div>

          <div className="w-full md:w-72 h-56 md:h-auto md:self-stretch shrink-0 overflow-hidden">
            <img
              src={OFERTA_IMG}
              alt="Oferta especial"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.className += ' bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200'
                e.target.style.display = 'none'
              }}
            />
          </div>
        </div>
      </section>

    </div>
  )
}
