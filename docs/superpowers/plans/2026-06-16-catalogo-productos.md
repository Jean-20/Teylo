# Catálogo y Productos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diferenciar Catálogo (descubrimiento por categoría) de Productos (filtrar y comprar) y enriquecer ProductCard con rating, marca y badge de descuento.

**Architecture:** Tres archivos modificados en orden de dependencia: ProductCard primero (usado por ambas páginas), luego Catálogo (reescritura), luego Productos (chips + toggle lista/cuadrícula). Sin nuevos archivos ni componentes externos — todo lo específico de cada página queda inline.

**Tech Stack:** React 18, React Router v6, Zustand, Tailwind CSS, Axios, Lucide React. Package manager: pnpm. Dev server: `pnpm dev` en `client/`.

---

## Archivos

| Acción | Archivo | Cambio |
|---|---|---|
| Modificar | `client/src/components/ui/ProductCard.jsx` | Badge descuento, marca, rating, reposicionar corazón |
| Modificar | `client/src/pages/Catalogo.jsx` | Reescritura completa — sidebar categorías + grid |
| Modificar | `client/src/pages/Productos.jsx` | Chips de filtros activos + toggle lista/cuadrícula |

---

## Task 1: ProductCard — badge descuento, marca y rating

**Archivos:**
- Modificar: `client/src/components/ui/ProductCard.jsx`

### Contexto

La card actual muestra: imagen (con badges "Nuevo" arriba-derecha y categoría abajo-izquierda), nombre, precio/precio-tachado, botón carrito y corazón wishlist (hover, arriba-izquierda). Faltan: badge de descuento, nombre de marca, rating. La prop `showDescription` se elimina porque ya no se usa.

**Nuevas posiciones de badges:**
- Descuento `-X%` → arriba-izquierda (solo si `discount >= 5`)
- "Nuevo" → arriba-derecha (sin cambio)
- Categoría → abajo-izquierda (sin cambio)
- Corazón wishlist → abajo-derecha (se mueve para no chocar con descuento)

- [ ] **Reemplazar `client/src/components/ui/ProductCard.jsx` completo**

```jsx
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
```

- [ ] **Verificar en el navegador**

Con el server corriendo (`pnpm dev` en `client/`), abrir `/productos` o `/` y confirmar:
- Aparece el nombre de marca en gris pequeño encima del nombre
- Las estrellas y número de reviews aparecen (si el producto tiene reviews)
- Badge `-X%` en rojo aparece sobre productos con descuento (por ejemplo Cuaderno de Diseño Premium: S/34.9 de S/42)
- El corazón al hacer hover aparece en la esquina inferior derecha
- El precio aparece en color púrpura (primary)

- [ ] **Commit**

```bash
git add client/src/components/ui/ProductCard.jsx
git commit -m "feat: add discount badge, brand and rating to ProductCard"
```

---

## Task 2: Catálogo — sidebar de categorías padre + grid de productos

**Archivos:**
- Modificar: `client/src/pages/Catalogo.jsx`

### Contexto

La API `GET /api/categories` devuelve todas las categorías con `parentId`, `imageUrl` y `_count.products`. Las categorías padre tienen `parentId: null`. El endpoint `GET /api/products?category=<slug>` acepta el slug de una categoría padre y el servidor devuelve productos de ella **y de todas sus subcategorías** (según el código del server). Se muestra un máximo de 9 productos (sin paginación) y un CTA "Ver todos" que lleva a `/productos?category=<slug>`.

- [ ] **Reemplazar `client/src/pages/Catalogo.jsx` completo**

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Package } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getCategories } from '../api/categories.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import ProductCard from '../components/ui/ProductCard.jsx'

export default function Catalogo() {
  const [categories, setCategories] = useState([])
  const [activeSlug, setActiveSlug] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(({ data }) => {
      const parents = data.data.filter((c) => c.parentId === null)
      setCategories(parents)
      if (parents.length > 0) setActiveSlug(parents[0].slug)
    })
  }, [])

  useEffect(() => {
    if (!activeSlug) return
    setLoading(true)
    getProducts({ category: activeSlug, limit: 9, sort: 'recent' })
      .then(({ data }) => setProducts(data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
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
                  {cat.imageUrl ? (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="w-8 h-8 rounded object-cover shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
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
```

- [ ] **Verificar en el navegador**

Abrir `/categorias` y confirmar:
- El sidebar muestra las categorías padre con imagen (Arte, Bolígrafos, Cuadernos, Organización)
- Al hacer clic en cada categoría, el grid de la derecha se actualiza con sus productos
- El título cambia al nombre de la categoría activa
- El link "Ver todos →" lleva a `/productos?category=<slug>` con el slug correcto
- El botón CTA en el fondo del grid también redirige correctamente
- Skeleton de carga aparece durante el fetch

- [ ] **Commit**

```bash
git add client/src/pages/Catalogo.jsx
git commit -m "feat: rewrite Catalogo with category sidebar and product grid"
```

---

## Task 3: Productos — chips de filtros activos + toggle lista/cuadrícula

**Archivos:**
- Modificar: `client/src/pages/Productos.jsx`

### Contexto

Se agregan dos features independientes:
1. **Chips de filtros activos** — fila de tags removibles entre el header y el grid, visibles solo cuando hay algún filtro activo. Chips: `Marca: Muji ×`, `Precio: hasta S/200 ×`, `★★★★ y más ×`.
2. **Toggle lista/cuadrícula** — botones ⊞/≡ en el header. Vista lista es el default. La vista lista muestra filas horizontales con imagen pequeña, marca, nombre, rating y precio. Se usa `ProductListRow` definido en el mismo archivo.

El filtro `category` puede llegar como searchParam cuando el usuario viene desde el CTA del Catálogo — ya lo soporta el `fetchProducts` existente pero no se mostraba en la UI. Se agrega su chip también.

- [ ] **Reemplazar `client/src/pages/Productos.jsx` completo**

```jsx
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Star, SlidersHorizontal, LayoutGrid, List, ShoppingCart, Heart, Package } from 'lucide-react'
import { getProducts } from '../api/products.js'
import { getBrands } from '../api/brands.js'
import { getImageUrl } from '../utils/getImageUrl.js'
import { formatPrice } from '../utils/formatPrice.js'
import { addToCart } from '../api/cart.js'
import { toggleWishlist } from '../api/wishlist.js'
import useAuthStore from '../store/authStore.js'
import useCartStore from '../store/cartStore.js'
import useWishlistStore from '../store/wishlistStore.js'
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
    <Link
      to={`/productos/${product.slug}`}
      className="group flex items-center gap-4 bg-white border border-gray-soft rounded-xl p-3 hover:shadow-md transition-shadow"
    >
      {/* Imagen pequeña */}
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-soft">
        {!imgError ? (
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
            <Package className="w-6 h-6 text-primary/30" />
          </div>
        )}
        {discount >= 5 && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.brand?.name && (
          <p className="text-[10px] text-gray-400 font-medium">{product.brand.name}</p>
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

      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleWishlist}
          className="p-1.5 rounded-full hover:bg-gray-soft transition"
          title={wishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary text-primary' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={addingCart}
          className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-60"
          title="Agregar al carrito"
        >
          <ShoppingCart className="w-4 h-4" />
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
  const [viewMode, setViewMode]     = useState('list') // 'list' | 'grid'

  const brand      = searchParams.get('brand')     || ''
  const maxPrice   = searchParams.get('maxPrice')  || '500'
  const minRating  = parseInt(searchParams.get('minRating') || '0')
  const category   = searchParams.get('category')  || ''
  const sort       = searchParams.get('sort')      || 'recent'
  const page       = parseInt(searchParams.get('page') || '1')

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const removeParam = (key) => setParam(key, '')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        sort, page, limit: 9,
        ...(brand    && { brand }),
        ...(category && { category }),
        maxPrice,
        ...(minRating > 0 && { rating: minRating }),
      }
      const { data } = await getProducts(params)
      setProducts(data.data.products)
      setTotal(data.data.total)
      setTotalPages(data.data.totalPages)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [brand, category, maxPrice, minRating, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    getBrands().then(({ data }) => setBrands(data.data))
  }, [])

  const clearFilters = () => setSearchParams({})

  // Chips de filtros activos
  const activeFilters = [
    ...(brand     ? [{ label: `Marca: ${brand}`,           key: 'brand'     }] : []),
    ...(category  ? [{ label: `Categoría: ${category}`,    key: 'category'  }] : []),
    ...(maxPrice !== '500' ? [{ label: `Hasta S/${maxPrice}`, key: 'maxPrice' }] : []),
    ...(minRating > 0 ? [{ label: `${'★'.repeat(minRating)} y más`, key: 'minRating' }] : []),
  ]

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
        {/* Header */}
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
            {/* Toggle vista */}
            <div className="flex items-center border border-gray-soft rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-soft'}`}
                title="Vista cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-soft'}`}
                title="Vista lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">Filtros:</span>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => removeParam(f.key)}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition"
              >
                {f.label}
                <span className="font-bold ml-0.5">×</span>
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-carbon underline transition"
            >
              Limpiar todos
            </button>
          </div>
        )}

        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
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
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4 border border-gray-soft rounded-xl p-3">
                  <div className="w-20 h-20 bg-gray-soft rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-gray-soft rounded w-1/4" />
                    <div className="h-3 bg-gray-soft rounded w-1/2" />
                    <div className="h-2 bg-gray-soft rounded w-1/3" />
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((p) => <ProductListRow key={p.id} product={p} />)}
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
```

- [ ] **Verificar en el navegador**

Abrir `/productos` y confirmar:
- La vista carga en modo **lista** por defecto (filas horizontales con imagen pequeña)
- El toggle ⊞/≡ cambia entre cuadrícula y lista correctamente
- Activar un filtro de marca → aparece chip `Marca: Muji ×` entre el header y la lista
- Activar filtro de precio diferente a S/500 → chip `Hasta S/XXX ×` aparece
- Activar rating → chip `★★★★ y más ×` aparece
- Hacer clic en un chip lo elimina y el filtro desaparece
- "Limpiar todos" elimina todos los chips y reinicia filtros
- Navegar a `/categorias`, hacer clic en "Ver todos" en cualquier categoría → llega a `/productos?category=<slug>` y aparece chip de categoría

- [ ] **Commit**

```bash
git add client/src/pages/Productos.jsx
git commit -m "feat: add filter chips and list/grid toggle to Productos"
```

---

## Verificación final del flujo completo

- [ ] Ir a `/categorias` → sidebar con imágenes de categorías, grid a la derecha
- [ ] Hacer clic en una categoría → grid se actualiza
- [ ] Hacer clic en "Ver todos" → llega a `/productos?category=<slug>`
- [ ] En `/productos` ver el chip de categoría activo
- [ ] Toggle lista/cuadrícula funciona
- [ ] Agregar otro filtro → aparece segundo chip
- [ ] Limpiar chips uno a uno y con "Limpiar todos"
- [ ] Las cards en cuadrícula muestran marca, rating y badge de descuento donde corresponde
- [ ] Los items de lista muestran la misma info enriquecida
