import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// GET /api/categories — lista plana con info de padre
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent:   { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count:   { select: { products: true } },
      },
    })
    res.json({ data: categories })
  } catch {
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        parent:   { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json({ data: category })
  } catch {
    res.status(500).json({ error: 'Error al obtener la categoría' })
  }
})

export default router
