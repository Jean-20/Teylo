import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon } from 'lucide-react'
import { searchProducts } from '../api/search.js'
import ProductCard from '../components/ui/ProductCard.jsx'

export default function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!q.trim()) { setProducts([]); return }
    setLoading(true)
    searchProducts(q)
      .then(({ data }) => setProducts(data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-carbon">
          {q ? `Resultados para "${q}"` : 'Buscar productos'}
        </h1>
        {!loading && q && (
          <p className="text-sm text-gray-400 mt-1">
            {products.length === 0 ? 'Sin resultados' : `${products.length} resultado${products.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-soft overflow-hidden">
              <div className="aspect-[4/3] bg-gray-soft" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-soft rounded w-3/4" />
                <div className="h-3 bg-gray-soft rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 && q ? (
        <div className="text-center py-24 text-gray-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No encontramos resultados para "{q}"</p>
          <p className="text-sm mt-1">Intenta con otro término.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
