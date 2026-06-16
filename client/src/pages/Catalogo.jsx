import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getCategories } from '../api/categories.js'
import { getBrands } from '../api/brands.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import Pagination from '../components/ui/Pagination.jsx'

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Menor precio'  },
  { value: 'price_desc', label: 'Mayor precio'   },
]

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const category = searchParams.get('category') || ''
  const brand    = searchParams.get('brand')    || ''
  const maxPrice = searchParams.get('maxPrice') || '500'
  const sort     = searchParams.get('sort')     || 'recent'
  const page     = parseInt(searchParams.get('page') || '1')

  const set = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sort, page, limit: 9, ...(category && { category }), ...(brand && { brand }), maxPrice }
      const { data } = await getProducts(params)
      setProducts(data.data.products)
      setTotal(data.data.total)
      setTotalPages(data.data.totalPages)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [category, brand, maxPrice, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([catRes, brandRes]) => {
      setSubcategories(catRes.data.data.filter((c) => c.parentId))
      setBrands(brandRes.data.data)
    })
  }, [])

  const clearFilters = () => setSearchParams({})

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-48 shrink-0 hidden md:block">
        <h3 className="font-semibold text-gray-carbon mb-4">Categorías</h3>
        <ul className="space-y-2 mb-6">
          {subcategories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={cat.slug}
                checked={category === cat.slug}
                onChange={() => set('category', category === cat.slug ? '' : cat.slug)}
                className="accent-primary"
              />
              <label
                htmlFor={cat.slug}
                className={`text-sm cursor-pointer ${category === cat.slug ? 'text-primary font-semibold' : 'text-gray-carbon'}`}
              >
                {cat.name}
              </label>
            </li>
          ))}
        </ul>

        <h3 className="font-semibold text-gray-carbon mb-3">Precio</h3>
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>S/0</span><span>S/{maxPrice}+</span>
        </div>
        <input
          type="range" min="50" max="1000" step="50"
          value={maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
          className="w-full accent-primary mb-6"
        />

        <h3 className="font-semibold text-gray-carbon mb-3">Marcas</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => set('brand', brand === b.name ? '' : b.name)}
              className={`text-xs px-2.5 py-1 rounded-full border transition
                ${brand === b.name
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-soft text-gray-carbon hover:border-primary'}`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <button
          onClick={clearFilters}
          className="w-full text-sm border border-gray-soft rounded py-2 text-gray-carbon hover:border-primary hover:text-primary transition"
        >
          Limpiar Filtros
        </button>
      </aside>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-carbon">Nuestro Catálogo</h1>
            <p className="text-sm text-gray-400 mt-1">Explora herramientas que inspiran tu creatividad.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{total} productos</span>
            <select
              value={sort}
              onChange={(e) => set('sort', e.target.value)}
              className="text-sm border border-gray-soft rounded px-3 py-2 text-gray-carbon focus:outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-soft overflow-hidden">
                <div className="aspect-[4/3] bg-gray-soft" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-soft rounded w-3/4" />
                  <div className="h-3 bg-gray-soft rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <SlidersHorizontal className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron productos con esos filtros.</p>
            <button onClick={clearFilters} className="mt-4 text-primary text-sm underline">Limpiar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={(p) => { const sp = new URLSearchParams(searchParams); sp.set('page', p); setSearchParams(sp) }} />
      </div>
    </div>
  )
}
