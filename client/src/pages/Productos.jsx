import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Star, SlidersHorizontal } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getBrands } from '../api/brands.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import Pagination from '../components/ui/Pagination.jsx'

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Menor precio'  },
  { value: 'price_desc', label: 'Mayor precio'   },
]

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [brands, setBrands]         = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)

  const brand    = searchParams.get('brand')    || ''
  const maxPrice = searchParams.get('maxPrice') || '500'
  const minRating = parseInt(searchParams.get('minRating') || '0')
  const sort     = searchParams.get('sort')     || 'recent'
  const page     = parseInt(searchParams.get('page') || '1')

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        sort, page, limit: 9,
        ...(brand && { brand }),
        maxPrice,
        ...(minRating > 0 && { rating: minRating }),
      }
      const { data } = await getProducts(params)
      setProducts(data.data.products)
      setTotal(data.data.total)
      setTotalPages(data.data.totalPages)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [brand, maxPrice, minRating, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    getBrands().then(({ data }) => setBrands(data.data))
  }, [])

  const clearFilters = () => setSearchParams({})

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 hidden md:block">
        <h3 className="font-semibold text-gray-carbon mb-4">Marcas</h3>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <input type="radio" id="brand-all" name="brand" checked={brand === ''} onChange={() => setParam('brand', '')} className="accent-primary" />
            <label htmlFor="brand-all" className={`text-sm cursor-pointer ${brand === '' ? 'text-primary font-semibold' : 'text-gray-carbon'}`}>Todas</label>
          </li>
          {brands.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <input type="radio" id={`brand-${b.id}`} name="brand" checked={brand === b.name} onChange={() => setParam('brand', b.name)} className="accent-primary" />
              <label htmlFor={`brand-${b.id}`} className={`text-sm cursor-pointer ${brand === b.name ? 'text-primary font-semibold' : 'text-gray-carbon'}`}>{b.name}</label>
            </li>
          ))}
        </ul>

        <h3 className="font-semibold text-gray-carbon mb-2">Precio máximo</h3>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>S/0</span><span>S/{maxPrice}+</span>
        </div>
        <input
          type="range" min="50" max="1000" step="50"
          value={maxPrice}
          onChange={(e) => setParam('maxPrice', e.target.value)}
          className="w-full accent-primary mb-6"
        />

        <h3 className="font-semibold text-gray-carbon mb-3">Valoración mínima</h3>
        <div className="flex flex-col gap-1.5 mb-6">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setParam('minRating', minRating === r ? '' : String(r))}
              className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded transition
                ${minRating === r ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-carbon hover:bg-gray-soft'}`}
            >
              <span className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </span>
              <span>y más</span>
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
            <h1 className="text-3xl font-bold text-gray-carbon">Productos</h1>
            <p className="text-sm text-gray-400 mt-1">Encuentra exactamente lo que necesitas.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{total} productos</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
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
                  <div className="h-3 bg-gray-soft rounded w-1/2" />
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
            {products.map((p) => <ProductCard key={p.id} product={p} showDescription />)}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => {
            const sp = new URLSearchParams(searchParams)
            sp.set('page', p)
            setSearchParams(sp)
          }}
        />
      </div>
    </div>
  )
}
