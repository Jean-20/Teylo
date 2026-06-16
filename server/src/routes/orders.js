import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where:   { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items:   { include: { product: { select: { name: true, imageUrl: true, slug: true } } } },
        address: true,
      },
    })
    res.json({
      data: orders.map((o) => ({
        ...o,
        total: Number(o.total),
        items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
      })),
    })
  } catch {
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
})

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where:   { id: req.params.id, userId: req.user.userId },
      include: {
        items:   { include: { product: { select: { name: true, imageUrl: true, slug: true, price: true } } } },
        address: true,
      },
    })
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json({
      data: {
        ...order,
        total: Number(order.total),
        items: order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
      },
    })
  } catch {
    res.status(500).json({ error: 'Error al obtener el pedido' })
  }
})

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  const { addressId } = req.body
  const userId = req.user.userId

  try {
    const cartItems = await prisma.cartItem.findMany({
      where:   { userId },
      include: { product: true },
    })

    if (!cartItems.length) {
      return res.status(400).json({ error: 'El carrito está vacío' })
    }

    const order = await prisma.$transaction(async (tx) => {
      // Verificar stock
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${item.product.name}"`)
        }
      }

      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      )

      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: addressId || null,
          status: 'PAID',
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: { items: true, address: true },
      })

      // Decrementar stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        })
      }

      // Vaciar carrito
      await tx.cartItem.deleteMany({ where: { userId } })

      return newOrder
    })

    res.status(201).json({
      data:    { ...order, total: Number(order.total) },
      message: 'Pedido creado exitosamente',
    })
  } catch (e) {
    const msg = e.message?.startsWith('Stock') ? e.message : 'Error al crear el pedido'
    res.status(400).json({ error: msg })
  }
})

export default router
