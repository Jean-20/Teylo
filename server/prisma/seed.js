import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Imágenes de picsum.photos — deterministas por seed name, siempre cargan
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`

async function main() {
  console.log('Limpiando base de datos...')
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // ── Categorías padre ───────────────────────────────────────────────────────
  console.log('Creando categorías...')
  const catCuadernos = await prisma.category.create({
    data: { name: 'Cuadernos', slug: 'cuadernos', imageUrl: img('cat-cuadernos', 500, 500) },
  })
  const catBoligrafos = await prisma.category.create({
    data: { name: 'Bolígrafos', slug: 'boligrafos', imageUrl: img('cat-boligrafos', 500, 500) },
  })
  const catArte = await prisma.category.create({
    data: { name: 'Arte', slug: 'arte', imageUrl: img('cat-arte', 500, 500) },
  })
  const catOrganizacion = await prisma.category.create({
    data: { name: 'Organización', slug: 'organizacion', imageUrl: img('cat-organizacion', 500, 500) },
  })

  // ── Subcategorías ──────────────────────────────────────────────────────────
  const subLibretas = await prisma.category.create({
    data: { name: 'Libretas & Agendas', slug: 'libretas-agendas', parentId: catCuadernos.id },
  })
  const subEscritura = await prisma.category.create({
    data: { name: 'Escritura & Plumones', slug: 'escritura-plumones', parentId: catBoligrafos.id },
  })
  const subEstuches = await prisma.category.create({
    data: { name: 'Estuches & Bolsos', slug: 'estuches-bolsos', parentId: catOrganizacion.id },
  })
  const subArteYDibujo = await prisma.category.create({
    data: { name: 'Arte & Dibujo', slug: 'arte-dibujo', parentId: catArte.id },
  })

  // ── Marcas ─────────────────────────────────────────────────────────────────
  console.log('Creando marcas...')
  const [tombow, moleskine, staedtler, muji, mildliner, pilot, leuchtturm] =
    await Promise.all([
      prisma.brand.create({ data: { name: 'Tombow' } }),
      prisma.brand.create({ data: { name: 'Moleskine' } }),
      prisma.brand.create({ data: { name: 'Staedtler' } }),
      prisma.brand.create({ data: { name: 'Muji' } }),
      prisma.brand.create({ data: { name: 'Mildliner' } }),
      prisma.brand.create({ data: { name: 'Pilot' } }),
      prisma.brand.create({ data: { name: 'Leuchtturm1917' } }),
    ])

  // ── Productos ──────────────────────────────────────────────────────────────
  console.log('Creando productos...')
  const products = await Promise.all([
    // Cuadernos
    prisma.product.create({
      data: {
        name: 'Cuaderno de Diseño Premium',
        slug: 'cuaderno-diseno-premium',
        description: 'Cuaderno de tapa dura, papel 120g libre de ácido, apertura 180°. Ideal para diseñadores y artistas.',
        price: 34.90,
        originalPrice: 42.00,
        stock: 40,
        isFeatured: true,
        isNew: false,
        label: 'EDICIÓN COLECCIONISTA',
        imageUrl: img('cuaderno-diseno-premium'),
        categoryId: catCuadernos.id,
        brandId: moleskine.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Agenda Velvet 2024',
        slug: 'agenda-velvet-2024',
        description: 'Agenda semanal con cubierta de terciopelo, papel crema 90g, separadores de colores.',
        price: 42.00,
        stock: 25,
        isFeatured: true,
        isNew: true,
        imageUrl: img('agenda-velvet-2024'),
        categoryId: subLibretas.id,
        brandId: moleskine.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dot Grid Journal Set',
        slug: 'dot-grid-journal-set',
        description: 'Set de 3 libretas dot grid A5, cubierta kraft, 160 páginas cada una.',
        price: 34.00,
        originalPrice: 45.00,
        stock: 60,
        isFeatured: false,
        isNew: true,
        imageUrl: img('dot-grid-journal-set'),
        categoryId: catCuadernos.id,
        brandId: leuchtturm.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cuaderno Premium A5',
        slug: 'cuaderno-premium-a5',
        description: 'Papel de 120g libre de ácido, ideal para acuarela y tinta.',
        price: 18.50,
        stock: 80,
        isFeatured: false,
        isNew: false,
        imageUrl: img('cuaderno-premium-a5'),
        categoryId: catCuadernos.id,
        brandId: leuchtturm.id,
      },
    }),

    // Bolígrafos / Escritura
    prisma.product.create({
      data: {
        name: 'Mildliner Pastel Pack',
        slug: 'mildliner-pastel-pack',
        description: 'Set de 10 resaltadores de doble punta en tonos pastel. Tinta suave, no transparenta.',
        price: 185.00,
        stock: 30,
        isFeatured: true,
        isNew: false,
        imageUrl: img('mildliner-pastel-pack'),
        categoryId: subEscritura.id,
        brandId: mildliner.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Plumas Gelly Roll Metallic',
        slug: 'plumas-gelly-roll-metallic',
        description: 'Set de 6 plumas gel metálicas. Escribe sobre papel oscuro, ideal para lettering.',
        price: 21.00,
        stock: 50,
        isFeatured: false,
        isNew: true,
        imageUrl: img('plumas-gelly-roll-metallic'),
        categoryId: subEscritura.id,
        brandId: pilot.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pluma Estilográfica Pro',
        slug: 'pluma-estilografica-pro',
        description: 'Tinta fluida y punta de iridio para escritura suave. Recargable.',
        price: 45.00,
        originalPrice: 58.00,
        stock: 20,
        isFeatured: true,
        isNew: true,
        imageUrl: img('pluma-estilografica-pro'),
        categoryId: subEscritura.id,
        brandId: pilot.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Set Caligrafía Dual',
        slug: 'set-caligrafia-dual',
        description: '12 colores vibrantes con punta de pincel y punta fina. Perfectos para lettering.',
        price: 32.00,
        stock: 35,
        isFeatured: false,
        isNew: false,
        imageUrl: img('set-caligrafia-dual'),
        categoryId: subEscritura.id,
        brandId: staedtler.id,
      },
    }),

    // Arte
    prisma.product.create({
      data: {
        name: 'Tombow Dual Brush Kit',
        slug: 'tombow-dual-brush-kit',
        description: 'Kit de 20 marcadores Dual Brush con colores brillantes y punta pincel + fina.',
        price: 65.00,
        originalPrice: 80.00,
        stock: 18,
        isFeatured: true,
        isNew: false,
        imageUrl: img('tombow-dual-brush-kit'),
        categoryId: catArte.id,
        brandId: tombow.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Set de Marcadores Artísticos',
        slug: 'set-marcadores-artisticos',
        description: 'Pack de 24 marcadores de doble punta, resistentes al agua.',
        price: 18.50,
        stock: 45,
        isFeatured: false,
        isNew: false,
        imageUrl: img('set-marcadores-artisticos'),
        categoryId: catArte.id,
        brandId: tombow.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pack Washi Tape Botánico',
        slug: 'pack-washi-tape-botanico',
        description: 'Cintas decorativas de papel arroz con diseños exclusivos de flores y hojas.',
        price: 12.00,
        stock: 70,
        isFeatured: false,
        isNew: true,
        imageUrl: img('pack-washi-tape-botanico'),
        categoryId: catArte.id,
        brandId: muji.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cuaderno de Bocetos A5',
        slug: 'cuaderno-bocetos-a5',
        description: 'Papel de 120g libre de ácido, ideal para acuarela y tinta. 80 hojas.',
        price: 18.50,
        stock: 55,
        isFeatured: false,
        isNew: false,
        imageUrl: img('cuaderno-bocetos-a5'),
        categoryId: subArteYDibujo.id,
        brandId: staedtler.id,
      },
    }),

    // Organización
    prisma.product.create({
      data: {
        name: 'Estuche Mesh Minimal',
        slug: 'estuche-mesh-minimal',
        description: 'Estuche de malla transpirable con cierre doble. Capacidad para 30+ utensilios.',
        price: 12.50,
        stock: 60,
        isFeatured: true,
        isNew: false,
        imageUrl: img('estuche-mesh-minimal'),
        categoryId: subEstuches.id,
        brandId: muji.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organizador Modular',
        slug: 'organizador-modular',
        description: 'Sistema magnético para mantener tu espacio impecable. 6 compartimentos ajustables.',
        price: 29.99,
        stock: 22,
        isFeatured: false,
        isNew: false,
        imageUrl: img('organizador-modular'),
        categoryId: catOrganizacion.id,
        brandId: muji.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Notas Semitransparentes',
        slug: 'notas-semitransparentes',
        description: 'No tapes tu contenido. Pack de 3 bloques degradados, 50 hojas c/u.',
        price: 8.50,
        stock: 100,
        isFeatured: false,
        isNew: true,
        imageUrl: img('notas-semitransparentes'),
        categoryId: catOrganizacion.id,
        brandId: muji.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Fixapapeles de Latón',
        slug: 'fixapapeles-laton',
        description: 'Set de 6 clips de latón dorado con diseño minimalista. Anti-oxido.',
        price: 22.00,
        stock: 80,
        isFeatured: false,
        isNew: false,
        imageUrl: img('fixapapeles-laton'),
        categoryId: catOrganizacion.id,
        brandId: muji.id,
      },
    }),
  ])

  // ── Usuario demo ───────────────────────────────────────────────────────────
  console.log('Creando usuario demo...')
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const ana = await prisma.user.create({
    data: {
      name: 'Ana García',
      email: 'ana@demo.com',
      passwordHash,
    },
  })

  const address = await prisma.address.create({
    data: {
      label: 'Casa',
      street: 'Calle de la Creatividad 123',
      city: 'Lima',
      postalCode: '15001',
      country: 'Perú',
      isPrimary: true,
      userId: ana.id,
    },
  })

  // ── Órdenes demo ───────────────────────────────────────────────────────────
  console.log('Creando órdenes demo...')
  await prisma.order.create({
    data: {
      status: 'DELIVERED',
      total: 45.00,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2024-10-12'),
      items: {
        create: [
          { quantity: 1, unitPrice: 45.00, productId: products[6].id },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      status: 'SHIPPED',
      total: 22.50,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2024-10-18'),
      items: {
        create: [
          { quantity: 1, unitPrice: 18.50, productId: products[3].id },
          { quantity: 2, unitPrice: 2.00,  productId: products[14].id },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      status: 'PENDING',
      total: 65.00,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2024-11-02'),
      items: {
        create: [
          { quantity: 1, unitPrice: 65.00, productId: products[8].id },
        ],
      },
    },
  })

  console.log('✓ Seed completado:')
  console.log(`  • 4 categorías padre + 4 subcategorías`)
  console.log(`  • 7 marcas`)
  console.log(`  • ${products.length} productos (con imágenes de picsum.photos)`)
  console.log(`  • 1 usuario demo → ana@demo.com / demo1234`)
  console.log(`  • 3 órdenes demo`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
