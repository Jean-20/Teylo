import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Package } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getCategories } from '../api/categories.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import ProductCard from '../components/ui/ProductCard.jsx'

export default function Catalogo() {
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [activeSlug, setActiveSlug] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState(new Set())

  useEffect(() => {
    const paramSlug = searchParams.get('category') || ''
    getCategories()
      .then(({ data }) => {
        const parents = data.data.filter((c) => c.parentId === null)
        setCategories(parents)
        setImgErrors(new Set())
        if (paramSlug && parents.some((c) => c.slug === paramSlug)) {
          setActiveSlug(paramSlug)
        } else if (parents.length > 0) {
          setActiveSlug(parents[0].slug)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeSlug) return
    const controller = new AbortController()
    setLoading(true)
    getProducts({ category: activeSlug, limit: 9, sort: 'recent' })
      .then(({ data }) => {
        if (!controller.signal.aborted) setProducts(data.data.products)
      })
      .catch(() => {
        if (!controller.signal.aborted) setProducts([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [activeSlug])

  const activeCategory = categories.find((c) => c.slug === activeSlug)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
      {/* Sidebar de categorías padre */}
      <aside className="w-52 shrink-0 hidden md:block">
        <h3 className="font-semibold text-gray-carbon mb-4">Categorías</h3>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const isActive = cat.slug === activeSlug
            return (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition text-left
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-carbon hover:bg-gray-soft'}`}
                >
                  {cat.imageUrl && !imgErrors.has(cat.slug) ? (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="w-8 h-8 rounded object-cover shrink-0"
                      onError={() => setImgErrors((prev) => { const s = new Set(prev); s.add(cat.slug); return s })}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-soft shrink-0 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {cat.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-carbon">
              {activeCategory?.name ?? 'Catálogo'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Explora nuestra selección de {activeCategory?.name.toLowerCase() ?? 'productos'}.
            </p>
          </div>
          {activeSlug && (
            <Link
              to={`/productos?category=${activeSlug}`}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline shrink-0"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-soft overflow-hidden">
                <div className="aspect-[4/3] bg-gray-soft" />
                <div className="p-3 space-y-2">
                  <div className="h-2 bg-gray-soft rounded w-1/4" />
                  <div className="h-3 bg-gray-soft rounded w-3/4" />
                  <div className="h-2 bg-gray-soft rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay productos en esta categoría aún.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="mt-8 text-center">
              <Link
                to={`/productos?category=${activeSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Ver todos en {activeCategory?.name} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
