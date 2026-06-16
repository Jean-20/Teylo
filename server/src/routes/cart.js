import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const ITEM_INCLUDE = {
  product: {
    include: {
      category: { select: { name: true, slug: true } },
      images:   { where: { isPrimary: true }, take: 1 },
    },
  },
}

// GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where:   { userId: req.user.userId },
      orderBy: { addedAt: 'asc' },
      include: ITEM_INCLUDE,
    })
    const data = items.map((i) => ({ ...i, product: { ...i.product, price: Number(i.product.price) } }))
    res.json({ data })
  } catch {
    res.status(500).json({ error: 'Error al obtener el carrito' })
  }
})

// POST /api/cart/items
router.post('/items', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body
  if (!productId) return res.status(400).json({ error: 'productId es requerido' })

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
    if (product.stock < 1) return res.status(400).json({ error: 'Producto sin stock' })

    const item = await prisma.cartItem.upsert({
      where:  { userId_productId: { userId: req.user.userId, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.userId, productId, quantity },
      include: ITEM_INCLUDE,
    })
    res.json({ data: { ...item, product: { ...item.product, price: Number(item.product.price) } }, message: 'Producto agregado al carrito' })
  } catch {
    res.status(500).json({ error: 'Error al agregar al carrito' })
  }
})

// PUT /api/cart/items/:id
router.put('/items/:id', authMiddleware, async (req, res) => {
  const { quantity } = req.body
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Cantidad inválida' })

  try {
    const item = await prisma.cartItem.update({
      where:   { id: req.params.id },
      data:    { quantity },
      include: ITEM_INCLUDE,
    })
    res.json({ data: { ...item, product: { ...item.product, price: Number(item.product.price) } } })
  } catch {
    res.status(500).json({ error: 'Error al actualizar el carrito' })
  }
})

// DELETE /api/cart/items/:id
router.delete('/items/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } })
    res.json({ message: 'Producto eliminado del carrito' })
  } catch {
    res.status(500).json({ error: 'Error al eliminar del carrito' })
  }
})

// DELETE /api/cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.userId } })
    res.json({ message: 'Carrito vaciado' })
  } catch {
    res.status(500).json({ error: 'Error al vaciar el carrito' })
  }
})

export default router
