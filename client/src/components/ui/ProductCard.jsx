import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Package } from 'lucide-react'
import { getImageUrl } from '../../utils/getImageUrl.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { addToCart } from '../../api/cart.js'
import { toggleWishlist } from '../../api/wishlist.js'
import useAuthStore from '../../store/authStore.js'
import useCartStore from '../../store/cartStore.js'
import useWishlistStore from '../../store/wishlistStore.js'

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuthStore()
  const { incrementCount } = useCartStore()
  const { isWishlisted, toggle } = useWishlistStore()
  const navigate = useNavigate()
  const [addingCart, setAddingCart] = useState(false)
  const [imgError, setImgError] = useState(false)

  const wishlisted = isWishlisted(product.id)

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    setAddingCart(true)
    try {
      await addToCart(product.id, 1)
      incrementCount()
    } catch {}
    finally { setAddingCart(false) }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    toggle(product.id)
    try {
      await toggleWishlist(product.id)
    } catch {
      toggle(product.id)
    }
  }

  return (
    <Link to={`/productos/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-soft hover:shadow-md transition-shadow">
        {/* Imagen */}
        <div className="relative aspect-[4/3] bg-gray-soft overflow-hidden">
          {!imgError ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 gap-2">
              <Package className="w-10 h-10 text-primary/30" />
              <span className="text-[10px] text-primary/40 font-medium px-3 text-center line-clamp-2">{product.name}</span>
            </div>
          )}

          {/* Badge descuento — arriba izquierda */}
          {discount >= 5 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}

          {/* Badge Nuevo — arriba derecha */}
          {product.isNew && (
            <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              Nuevo
            </span>
          )}

          {/* Badge categoría — abajo izquierda */}
          {product.category?.name && (
            <span className="absolute bottom-2 left-2 bg-white/90 text-gray-carbon text-[10px] px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}

          {/* Corazón wishlist — abajo derecha */}
          <button
            onClick={handleWishlist}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition opacity-0 group-hover:opacity-100"
            title={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-primary text-primary' : 'text-gray-carbon'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {product.brand?.name && (
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">{product.brand.name}</p>
            )}
            <p className="font-semibold text-sm text-gray-carbon truncate">{product.name}</p>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-yellow-400 text-xs leading-none">
                  {'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}
                </span>
                <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingCart}
            className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-60"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
