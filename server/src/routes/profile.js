import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    })
    res.json({ data: user })
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

// PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
  const { name, avatarUrl } = req.body
  try {
    const user = await prisma.user.update({
      where:  { id: req.user.userId },
      data:   { ...(name && { name }), ...(avatarUrl !== undefined && { avatarUrl }) },
      select: { id: true, name: true, email: true, avatarUrl: true },
    })
    res.json({ data: user, message: 'Perfil actualizado' })
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
})

// PUT /api/profile/password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Contraseñas requeridas' })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' })

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.user.userId }, data: { passwordHash } })
    res.json({ message: 'Contraseña actualizada' })
  } catch {
    res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
})

// GET /api/profile/addresses
router.get('/addresses', authMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where:   { userId: req.user.userId },
      orderBy: { isPrimary: 'desc' },
    })
    res.json({ data: addresses })
  } catch {
    res.status(500).json({ error: 'Error al obtener direcciones' })
  }
})

// POST /api/profile/addresses
router.post('/addresses', authMiddleware, async (req, res) => {
  const { label, street, city, state, postalCode, country, isPrimary } = req.body
  if (!street || !city) {
    return res.status(400).json({ error: 'Calle y ciudad son requeridos' })
  }
  try {
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data:  { isPrimary: false },
      })
    }
    const address = await prisma.address.create({
      data: {
        userId:    req.user.userId,
        label:     label || 'Dirección',
        street,
        city,
        state:     state  || null,
        postalCode: postalCode || null,
        country:   country || 'Perú',
        isPrimary: !!isPrimary,
      },
    })
    res.status(201).json({ data: address, message: 'Dirección agregada' })
  } catch (e) {
    console.error('[POST /addresses]', e)
    res.status(500).json({ error: e?.message || 'Error al agregar dirección' })
  }
})

// PUT /api/profile/addresses/:id
router.put('/addresses/:id', authMiddleware, async (req, res) => {
  const { label, street, city, state, postalCode, country, isPrimary } = req.body
  try {
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data:  { isPrimary: false },
      })
    }
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: {
        ...(label     !== undefined && { label: label || 'Dirección' }),
        ...(street    !== undefined && { street }),
        ...(city      !== undefined && { city }),
        ...(state     !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country   !== undefined && { country }),
        isPrimary: !!isPrimary,
      },
    })
    res.json({ data: address, message: 'Dirección actualizada' })
  } catch {
    res.status(500).json({ error: 'Error al actualizar dirección' })
  }
})

// DELETE /api/profile/addresses/:id
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id } })
    res.json({ message: 'Dirección eliminada' })
  } catch {
    res.status(500).json({ error: 'Error al eliminar dirección' })
  }
})

export default router
