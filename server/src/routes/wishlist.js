import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
            images:   { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    })
    const data = items.map((i) => ({ ...i, product: { ...i.product, price: Number(i.product.price) } }))
    res.json({ data })
  } catch {
    res.status(500).json({ error: 'Error al obtener favoritos' })
  }
})

// POST /api/wishlist  — toggle
router.post('/', authMiddleware, async (req, res) => {
  const { productId } = req.body
  if (!productId) return res.status(400).json({ error: 'productId es requerido' })

  try {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.userId, productId } },
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return res.json({ data: { wishlisted: false }, message: 'Eliminado de favoritos' })
    }

    await prisma.wishlist.create({ data: { userId: req.user.userId, productId } })
    res.json({ data: { wishlisted: true }, message: 'Agregado a favoritos' })
  } catch {
    res.status(500).json({ error: 'Error al actualizar favoritos' })
  }
})

export default router
