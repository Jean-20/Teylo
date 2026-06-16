import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Star, SlidersHorizontal, LayoutGrid, List, ShoppingCart, Package } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getBrands } from '../api/brands.js'
import { addToCart } from '../api/cart.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import { formatPrice } from '../utils/formatPrice.js'
import useAuthStore from '../store/authStore.js'
import useCartStore from '../store/cartStore.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import Pagination from '../components/ui/Pagination.jsx'

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Menor precio'  },
  { value: 'price_desc', label: 'Mayor precio'   },
]

function ProductListRow({ product }) {
  const { isAuthenticated } = useAuthStore()
  const { incrementCount } = useCartStore()
  const navigate = useNavigate()
  const [addingCart, setAddingCart] = useState(false)

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    setAddingCart(true)
    try {
      await addToCart(product.id, 1)
      incrementCount()
    } catch {}
    finally { setAddingCart(false) }
  }

  return (
    <Link to={`/productos/${product.slug}`} className="group flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-soft hover:shadow-md transition-shadow">
      <div className="w-[60px] h-[60px] shrink-0 rounded-lg overflow-hidden bg-gray-soft relative">
        {product.imageUrl ? (
          <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
        )}
        {discount >= 5 && product.originalPrice > product.price && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-semibold px-1 py-0.5 rounded">-{discount}%</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {product.brand?.name && <p className="text-[10px] text-gray-400 font-medium">{product.brand.name}</p>}
        <p className="font-semibold text-sm text-gray-carbon truncate">{product.name}</p>
        {product.reviewCount > 0 && product.avgRating != null && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">
              {(() => {
                const s = Math.min(5, Math.max(0, Math.round(product.avgRating)))
                return '★'.repeat(s) + '☆'.repeat(5 - s)
              })()}
            </span>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}
        </div>
        <button
          onClick={handleCart}
          disabled={addingCart}
          className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition shrink-0 disabled:opacity-60"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
        </button>
      </div>
    </Link>
  )
}

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [brands, setBrands]         = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [viewMode, setViewMode]     = useState('list')

  const brand     = searchParams.get('brand')     || ''
  const maxPrice  = searchParams.get('maxPrice')  || '500'
  const minRating = parseInt(searchParams.get('minRating') || '0')
  const sort      = searchParams.get('sort')      || 'recent'
  const page      = parseInt(searchParams.get('page') || '1')
  const category  = searchParams.get('category') || ''

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const params = {
      sort, page, limit: 9,
      ...(brand && { brand }),
      maxPrice,
      ...(minRating > 0 && { rating: minRating }),
      ...(category && { category }),
    }
    getProducts(params)
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setProducts(data.data.products)
          setTotal(data.data.total)
          setTotalPages(data.data.totalPages)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setProducts([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [brand, maxPrice, minRating, sort, page, category])

  useEffect(() => {
    getBrands().then(({ data }) => setBrands(data.data))
  }, [])

  const clearFilters = () => setSearchParams({})

  const hasActiveFilters = brand !== '' || maxPrice !== '500' || minRating > 0 || category !== ''

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
      {/* Sidebar */}
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

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-4">
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
            <div className="flex border border-gray-soft rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-carbon hover:bg-gray-soft'}`}
                title="Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-carbon hover:bg-gray-soft'}`}
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {brand !== '' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                Marca: {brand}
                <button onClick={() => setParam('brand', '')} className="hover:text-red-500">×</button>
              </span>
            )}
            {maxPrice !== '500' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                Precio: hasta S/{maxPrice}
                <button onClick={() => setParam('maxPrice', '')} className="hover:text-red-500">×</button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                Rating: {'★'.repeat(minRating)} y más
                <button onClick={() => setParam('minRating', '')} className="hover:text-red-500">×</button>
              </span>
            )}
            {category !== '' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                Categoría: {category}
                <button onClick={() => setParam('category', '')} className="hover:text-red-500">×</button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-primary ml-auto">
              Limpiar todos
            </button>
          </div>
        )}

        {loading ? (
          viewMode === 'list' ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-soft">
                  <div className="w-[60px] h-[60px] bg-gray-soft rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-gray-soft rounded w-1/4" />
                    <div className="h-3 bg-gray-soft rounded w-3/4" />
                    <div className="h-2 bg-gray-soft rounded w-1/3" />
                  </div>
                  <div className="w-20 space-y-1 shrink-0">
                    <div className="h-4 bg-gray-soft rounded" />
                    <div className="h-3 bg-gray-soft rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <SlidersHorizontal className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron productos con esos filtros.</p>
            <button onClick={clearFilters} className="mt-4 text-primary text-sm underline">Limpiar filtros</button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {products.map((p) => <ProductListRow key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
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
