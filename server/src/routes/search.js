import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// GET /api/search?q=
router.get('/', async (req, res) => {
  const q = req.query.q?.trim()
  if (!q) return res.json({ data: [] })

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name:        { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      include: {
        category: { select: { name: true, slug: true } },
        brand:    { select: { name: true } },
        images:   { where: { isPrimary: true }, take: 1 },
        reviews:  { select: { rating: true } },
      },
    })

    const data = products.map((p) => {
      const { reviews, ...rest } = p
      const avgRating = reviews.length
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0
      return { ...rest, price: Number(rest.price), originalPrice: rest.originalPrice != null ? Number(rest.originalPrice) : null, avgRating, reviewCount: reviews.length }
    })

    res.json({ data })
  } catch {
    res.status(500).json({ error: 'Error en la búsqueda' })
  }
})

export default router
