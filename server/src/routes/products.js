import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// Incluye los campos relacionados que se repiten en varias consultas
const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  brand:    { select: { id: true, name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true } },
  reviews:  { select: { rating: true } },
}

function computeAvgRating(reviews) {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function formatProduct(p) {
  const { reviews, ...rest } = p
  return {
    ...rest,
    price: Number(rest.price),
    originalPrice: rest.originalPrice != null ? Number(rest.originalPrice) : null,
    avgRating: Math.round(computeAvgRating(reviews) * 10) / 10,
    reviewCount: reviews.length,
  }
}

// Devuelve [categoryId, ...childrenIds] dado un slug de categoría
async function resolveCategoryIds(slug) {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  })
  if (!cat) return null
  return [cat.id, ...cat.children.map((c) => c.id)]
}

// GET /api/products/featured  — debe ir ANTES de /:slug
router.get('/featured', async (_req, res) => {
  try {
    const raw = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: PRODUCT_INCLUDE,
    })
    res.json({ data: raw.map(formatProduct) })
  } catch {
    res.status(500).json({ error: 'Error al obtener productos destacados' })
  }
})

// GET /api/products
router.get('/', async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort = 'recent',
    page = 1,
    limit = 12,
  } = req.query

  const pageNum  = Math.max(1, parseInt(page))
  const limitNum = Math.min(48, Math.max(1, parseInt(limit)))
  const minRating = rating ? parseFloat(rating) : null

  try {
    // Construir where dinámicamente
    const where = {}

    if (category) {
      const ids = await resolveCategoryIds(category)
      if (!ids) return res.json({ data: { products: [], total: 0, page: pageNum, totalPages: 0 } })
      where.categoryId = { in: ids }
    }

    if (brand) {
      const brandRecord = await prisma.brand.findFirst({ where: { name: { equals: brand, mode: 'insensitive' } } })
      if (!brandRecord) return res.json({ data: { products: [], total: 0, page: pageNum, totalPages: 0 } })
      where.brandId = brandRecord.id
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Ordenamiento
    const orderBy =
      sort === 'price_asc'  ? { price: 'asc' }  :
      sort === 'price_desc' ? { price: 'desc' } :
                              { createdAt: 'desc' }

    const raw = await prisma.product.findMany({ where, orderBy, include: PRODUCT_INCLUDE })

    // Aplicar filtro de rating en JS (dataset pequeño)
    let products = raw.map(formatProduct)
    if (minRating) products = products.filter((p) => p.avgRating >= minRating)

    // Paginación manual (necesaria porque el rating filtra post-query)
    const total      = products.length
    const totalPages = Math.ceil(total / limitNum)
    const paginated  = products.slice((pageNum - 1) * limitNum, pageNum * limitNum)

    res.json({ data: { products: paginated, total, page: pageNum, totalPages } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
})

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand:    { select: { id: true, name: true } },
        images:   true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    })

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

    const avgRating   = Math.round(computeAvgRating(product.reviews) * 10) / 10
    const reviewCount = product.reviews.length

    // Productos relacionados (misma categoría, excluye el actual)
    const rawRelated = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: PRODUCT_INCLUDE,
    })

    res.json({
      data: {
        ...product,
        price:         Number(product.price),
        originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
        avgRating,
        reviewCount,
        related: rawRelated.map(formatProduct),
      },
    })
  } catch {
    res.status(500).json({ error: 'Error al obtener el producto' })
  }
})

export default router
