import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// GET /api/brands
router.get('/', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    res.json({ data: brands })
  } catch {
    res.status(500).json({ error: 'Error al obtener marcas' })
  }
})

export default router
