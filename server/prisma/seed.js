import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // ── Categorías ─────────────────────────────────────────────────────────────
  console.log('Creando categorías...')
  const [catJugueteria, catTecnologia, catArteDiseno, catEscolar, catUniversitario, catOficina, catManualidades] =
    await Promise.all([
      prisma.category.create({ data: { name: 'Juguetería',    slug: 'jugueteria',    imageUrl: img('cat-jugueteria', 500, 500)    } }),
      prisma.category.create({ data: { name: 'Tecnología',    slug: 'tecnologia',    imageUrl: img('cat-tecnologia', 500, 500)    } }),
      prisma.category.create({ data: { name: 'Arte y Diseño', slug: 'arte-diseno',   imageUrl: img('cat-arte-diseno', 500, 500)   } }),
      prisma.category.create({ data: { name: 'Escolar',       slug: 'escolar',       imageUrl: img('cat-escolar', 500, 500)       } }),
      prisma.category.create({ data: { name: 'Universitario', slug: 'universitario', imageUrl: img('cat-universitario', 500, 500) } }),
      prisma.category.create({ data: { name: 'Oficina',       slug: 'oficina',       imageUrl: img('cat-oficina', 500, 500)       } }),
      prisma.category.create({ data: { name: 'Manualidades',  slug: 'manualidades',  imageUrl: img('cat-manualidades', 500, 500)  } }),
    ])

  // ── Marcas ─────────────────────────────────────────────────────────────────
  console.log('Creando marcas...')
  const [faber, casio, crayola, stabilo, bic, maped, scotch3m, winsor, pilot, mattel] =
    await Promise.all([
      prisma.brand.create({ data: { name: 'Faber-Castell'   } }),
      prisma.brand.create({ data: { name: 'Casio'           } }),
      prisma.brand.create({ data: { name: 'Crayola'         } }),
      prisma.brand.create({ data: { name: 'Stabilo'         } }),
      prisma.brand.create({ data: { name: 'BIC'             } }),
      prisma.brand.create({ data: { name: 'Maped'           } }),
      prisma.brand.create({ data: { name: '3M'              } }),
      prisma.brand.create({ data: { name: 'Winsor & Newton' } }),
      prisma.brand.create({ data: { name: 'Pilot'           } }),
      prisma.brand.create({ data: { name: 'Mattel'          } }),
    ])

  // ── Productos ──────────────────────────────────────────────────────────────
  console.log('Creando productos...')
  const products = await Promise.all([

    // ── Juguetería [0-5] ──────────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Set de Plastilina 12 Colores',
      slug: 'set-plastilina-12-colores',
      description: 'Plastilina suave y moldeable en 12 colores vivos. No tóxica, apta para niños desde 3 años. Estimula la creatividad y la motricidad fina.',
      price: 18.90, originalPrice: 24.00, stock: 80,
      isNew: false, isFeatured: true, label: 'MÁS VENDIDO',
      imageUrl: img('plastilina-colores'),
      categoryId: catJugueteria.id, brandId: crayola.id,
    }}),
    prisma.product.create({ data: {
      name: 'Rompecabezas Sistema Solar 500 Piezas',
      slug: 'rompecabezas-sistema-solar-500',
      description: 'Rompecabezas con ilustraciones del sistema solar. Piezas gruesas y resistentes, ideal para niños de 8 años en adelante. Incluye póster de referencia.',
      price: 34.90, stock: 45,
      isNew: true, isFeatured: true,
      imageUrl: img('rompecabezas-500'),
      categoryId: catJugueteria.id, brandId: mattel.id,
    }}),
    prisma.product.create({ data: {
      name: 'Ajedrez Clásico de Madera',
      slug: 'ajedrez-clasico-madera',
      description: 'Tablero de ajedrez en madera de pino con piezas talladas a mano. Incluye estuche de almacenamiento. Estimula la lógica y el pensamiento estratégico.',
      price: 55.00, originalPrice: 70.00, stock: 20,
      isNew: false, isFeatured: false,
      imageUrl: img('ajedrez-madera'),
      categoryId: catJugueteria.id, brandId: mattel.id,
    }}),
    prisma.product.create({ data: {
      name: 'Bloques de Construcción Magnéticos 64 piezas',
      slug: 'bloques-magneticos-64',
      description: 'Set de 64 piezas magnéticas de colores para construir figuras en 2D y 3D. Desarrolla la imaginación y las habilidades espaciales en niños de 4 a 12 años.',
      price: 89.90, originalPrice: 110.00, stock: 30,
      isNew: true, isFeatured: true, label: 'NUEVO',
      imageUrl: img('bloques-magneticos'),
      categoryId: catJugueteria.id, brandId: mattel.id,
    }}),
    prisma.product.create({ data: {
      name: 'Kit de Pintura para Niños Completo',
      slug: 'kit-pintura-ninos-completo',
      description: 'Set con 12 témperas lavables, 2 pinceles, paleta y lienzo 30x40cm. Pinturas no tóxicas y de fácil limpieza. Incluye delantal protector.',
      price: 28.50, stock: 55,
      isNew: false, isFeatured: false,
      imageUrl: img('kit-pintura-ninos'),
      categoryId: catJugueteria.id, brandId: crayola.id,
    }}),
    prisma.product.create({ data: {
      name: 'Tangram de Madera Premium',
      slug: 'tangram-madera-premium',
      description: '7 piezas de madera maciza en colores brillantes para crear cientos de figuras. Incluye libro con 100 desafíos ordenados por dificultad. Apto desde 4 años.',
      price: 22.00, stock: 40,
      isNew: false, isFeatured: false,
      imageUrl: img('tangram-madera'),
      categoryId: catJugueteria.id, brandId: mattel.id,
    }}),

    // ── Tecnología [6-11] ─────────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Calculadora Científica Casio FX-991',
      slug: 'calculadora-cientifica-casio-fx991',
      description: 'Calculadora científica con 417 funciones, pantalla de alta definición y modo de cálculo natural. Ideal para ingeniería, matemáticas y física. Sin baterías AA.',
      price: 75.00, originalPrice: 95.00, stock: 60,
      isNew: false, isFeatured: true, label: 'TOP VENTAS',
      imageUrl: img('calculadora-casio'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),
    prisma.product.create({ data: {
      name: 'Tableta Digitalizadora Gráfica',
      slug: 'tableta-digitalizadora-grafica',
      description: 'Área activa 21x13cm, resolución 5080 LPI y 8192 niveles de presión. Compatible con Windows, Mac y Linux. Perfecta para diseñadores e ilustradores digitales.',
      price: 180.00, originalPrice: 230.00, stock: 15,
      isNew: true, isFeatured: true, label: 'OFERTA',
      imageUrl: img('tableta-digitalizadora'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),
    prisma.product.create({ data: {
      name: 'Memoria USB 64GB Ultra 3.0',
      slug: 'memoria-usb-64gb-ultra',
      description: 'Memoria USB 3.0 de 64GB con lectura hasta 100 MB/s. Diseño compacto y resistente al agua. Ideal para estudiantes y profesionales que necesitan llevar sus archivos.',
      price: 32.90, stock: 100,
      isNew: false, isFeatured: false,
      imageUrl: img('memoria-usb-64gb'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),
    prisma.product.create({ data: {
      name: 'Audífonos Inalámbricos con Cancelación de Ruido',
      slug: 'audifonos-inalambricos-cancelacion-ruido',
      description: 'Audífonos over-ear con cancelación activa de ruido, 30 horas de batería y Bluetooth 5.0. Plegables y ligeros, perfectos para estudiar en cualquier ambiente.',
      price: 145.00, originalPrice: 180.00, stock: 25,
      isNew: true, isFeatured: true,
      imageUrl: img('audifonos-bluetooth'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),
    prisma.product.create({ data: {
      name: 'Lámpara LED de Escritorio con Puerto USB',
      slug: 'lampara-led-escritorio-usb',
      description: 'Lámpara con 3 modos de iluminación, atenuador táctil y puerto USB de carga integrado. Cuello flexible de 360°. Ideal para leer y estudiar de noche sin cansar la vista.',
      price: 49.90, stock: 40,
      isNew: false, isFeatured: false,
      imageUrl: img('lampara-led-escritorio'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),
    prisma.product.create({ data: {
      name: 'Soporte Ergonómico para Laptop Aluminio',
      slug: 'soporte-ergonomico-laptop-aluminio',
      description: 'Soporte de aluminio ajustable en 6 alturas, compatible con laptops de 10" a 17". Mejora la postura y reduce la fatiga. Incluye 2 puertos USB Hub adicionales.',
      price: 68.00, originalPrice: 85.00, stock: 35,
      isNew: false, isFeatured: false,
      imageUrl: img('soporte-laptop'),
      categoryId: catTecnologia.id, brandId: casio.id,
    }}),

    // ── Arte y Diseño [12-17] ─────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Set de Lápices de Grafito Profesional 16 piezas',
      slug: 'set-lapices-grafito-profesional-16',
      description: 'Juego de 16 lápices de grafito desde 6H hasta 8B. Núcleo de carbón de alta calidad para trazos precisos y suaves. Estuche de lata incluido. Para dibujantes y artistas.',
      price: 42.00, originalPrice: 55.00, stock: 50,
      isNew: false, isFeatured: true, label: 'PROFESIONAL',
      imageUrl: img('lapices-grafito-profesional'),
      categoryId: catArteDiseno.id, brandId: faber.id,
    }}),
    prisma.product.create({ data: {
      name: 'Acuarelas Premium 24 Colores',
      slug: 'acuarelas-premium-24-colores',
      description: '24 pastillas de acuarela con pigmentos de alta concentración. Gran luminosidad y resistencia a la luz. Incluye pincel de pelo de marta y paleta mezcladora.',
      price: 65.00, originalPrice: 80.00, stock: 30,
      isNew: true, isFeatured: true, label: 'NUEVO',
      imageUrl: img('acuarelas-premium'),
      categoryId: catArteDiseno.id, brandId: winsor.id,
    }}),
    prisma.product.create({ data: {
      name: 'Marcadores Copic Ciao 12 Colores Básicos',
      slug: 'marcadores-copic-ciao-12-basicos',
      description: 'Set de 12 marcadores Copic Ciao recargables con punta de pincel y punta fina. Tinta a base de alcohol, sin olor. El preferido de ilustradores y diseñadores gráficos.',
      price: 120.00, originalPrice: 150.00, stock: 18,
      isNew: false, isFeatured: true,
      imageUrl: img('marcadores-copic'),
      categoryId: catArteDiseno.id, brandId: winsor.id,
    }}),
    prisma.product.create({ data: {
      name: 'Lienzo para Pintura 40x50 cm Pack x3',
      slug: 'lienzo-pintura-40x50-pack-x3',
      description: 'Pack de 3 lienzos de algodón 100% tensados sobre bastidor de pino. 3 capas de gesso aplicadas a mano. Compatible con acrílico, óleo y pintura al frío.',
      price: 38.00, stock: 45,
      isNew: false, isFeatured: false,
      imageUrl: img('lienzo-pintura-40x50'),
      categoryId: catArteDiseno.id, brandId: winsor.id,
    }}),
    prisma.product.create({ data: {
      name: 'Set de Pinceles Profesionales 15 piezas',
      slug: 'set-pinceles-profesionales-15',
      description: '15 pinceles de pelo sintético de alta calidad para acuarela, acrílico y óleo. Mango largo de madera lacada. Estuche enrollable de lona incluido.',
      price: 35.90, stock: 40,
      isNew: false, isFeatured: false,
      imageUrl: img('set-pinceles-profesionales'),
      categoryId: catArteDiseno.id, brandId: winsor.id,
    }}),
    prisma.product.create({ data: {
      name: 'Gouache Profesional 18 Colores',
      slug: 'gouache-profesional-18-colores',
      description: 'Set de 18 tubos de gouache opaco de 21ml con alta concentración de pigmento. Colores vibrantes y cubrientes. Ideal para ilustración, diseño gráfico y publicidad.',
      price: 78.00, originalPrice: 95.00, stock: 22,
      isNew: true, isFeatured: false,
      imageUrl: img('gouache-profesional'),
      categoryId: catArteDiseno.id, brandId: winsor.id,
    }}),

    // ── Escolar [18-23] ───────────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Mochila Escolar Ergonómica 28L',
      slug: 'mochila-escolar-ergonomica-28l',
      description: 'Mochila de poliéster 600D con espaldar ergonómico acolchado, 3 compartimentos y bolsillos laterales. Capacidad 28L con refuerzos en puntos de tensión. Impermeable.',
      price: 59.90, originalPrice: 79.00, stock: 35,
      isNew: false, isFeatured: true, label: 'OFERTA',
      imageUrl: img('mochila-escolar'),
      categoryId: catEscolar.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Set de Reglas Geométricas 4 piezas',
      slug: 'set-reglas-geometricas-4',
      description: 'Set escolar de 4 piezas: regla 30cm, escuadra 45°, cartabón 60° y transportador 180°. Plástico transparente irrompible con borde metálico antideslizante.',
      price: 12.90, stock: 120,
      isNew: false, isFeatured: false,
      imageUrl: img('set-reglas-geometricas'),
      categoryId: catEscolar.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Compás Profesional con Estuche de Aluminio',
      slug: 'compas-profesional-estuche-aluminio',
      description: 'Compás de precisión con punta de metal y mecanismo de ajuste fino. Apto para dibujo técnico y geométrico. Incluye estuche de aluminio con accesorios completos.',
      price: 18.50, originalPrice: 25.00, stock: 65,
      isNew: false, isFeatured: false,
      imageUrl: img('compas-profesional'),
      categoryId: catEscolar.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Cuaderno Cuadriculado A4 200 hojas',
      slug: 'cuaderno-cuadriculado-a4-200',
      description: 'Cuaderno de 200 hojas cuadriculadas con tapa dura plastificada. Papel 75g/m² sin sangrado y espiral metálico doble. Ideal para matemáticas, ciencias e ingeniería.',
      price: 14.90, stock: 150,
      isNew: false, isFeatured: true,
      imageUrl: img('cuaderno-cuadriculado-a4'),
      categoryId: catEscolar.id, brandId: faber.id,
    }}),
    prisma.product.create({ data: {
      name: 'Colores Faber-Castell Largos x24',
      slug: 'colores-faber-castell-largos-x24',
      description: 'Set de 24 lápices de color con mina resistente a la rotura de 3.8mm. Colores vibrantes de alta pigmentación. Madera de cedro FSC certificada. Para escolares y artistas.',
      price: 22.90, originalPrice: 28.00, stock: 90,
      isNew: false, isFeatured: true, label: 'FAVORITO',
      imageUrl: img('colores-faber-castell-24'),
      categoryId: catEscolar.id, brandId: faber.id,
    }}),
    prisma.product.create({ data: {
      name: 'Borrador Blanco Premium Pack x5',
      slug: 'borrador-blanco-premium-x5',
      description: 'Pack de 5 borradores de PVC suave que borran limpio sin manchar ni dañar el papel. No deja residuos de goma. Compatible con grafito y lápiz de color.',
      price: 8.50, stock: 200,
      isNew: false, isFeatured: false,
      imageUrl: img('borrador-blanco-premium'),
      categoryId: catEscolar.id, brandId: faber.id,
    }}),

    // ── Universitario [24-29] ─────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Agenda Universitaria 2025',
      slug: 'agenda-universitaria-2025',
      description: 'Agenda semanal y mensual de 352 páginas, tapa dura de cuero sintético. Incluye planificación anual, notas, tablas útiles y directorio. Marcador de tela incluido.',
      price: 38.00, originalPrice: 48.00, stock: 60,
      isNew: true, isFeatured: true, label: 'NUEVO 2025',
      imageUrl: img('agenda-universitaria-2025'),
      categoryId: catUniversitario.id, brandId: stabilo.id,
    }}),
    prisma.product.create({ data: {
      name: 'Resaltadores Stabilo Boss x6 Colores',
      slug: 'resaltadores-stabilo-boss-x6',
      description: 'Pack de 6 resaltadores Stabilo Boss en colores pastel y neón. Punta biselada para resaltado ancho y fino. Tinta fluorescente resistente a la luz. Duración extra larga.',
      price: 19.90, originalPrice: 26.00, stock: 110,
      isNew: false, isFeatured: true,
      imageUrl: img('resaltadores-stabilo-boss'),
      categoryId: catUniversitario.id, brandId: stabilo.id,
    }}),
    prisma.product.create({ data: {
      name: 'Cuaderno Espiral A4 Rayado 200 hojas',
      slug: 'cuaderno-espiral-a4-200-rayado',
      description: 'Cuaderno de 200 hojas rayadas con espiral metálico doble y tapa flexible. Papel blanco 75g, perforado para archivador. Incluye 4 separadores de colores.',
      price: 12.50, stock: 180,
      isNew: false, isFeatured: false,
      imageUrl: img('cuaderno-espiral-a4'),
      categoryId: catUniversitario.id, brandId: stabilo.id,
    }}),
    prisma.product.create({ data: {
      name: 'Carpeta Portadocumentos A4 40 bolsillos',
      slug: 'carpeta-portadocumentos-a4-40',
      description: 'Carpeta con 40 bolsillos transparentes, cubierta rígida antiarañazos y cierre elástico. Clasifica apuntes, contratos y documentos sin dañarlos. Capacidad 80 hojas.',
      price: 16.90, stock: 75,
      isNew: false, isFeatured: false,
      imageUrl: img('carpeta-portadocumentos-a4'),
      categoryId: catUniversitario.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Post-it Notes Multicolor Set x10 blocks',
      slug: 'post-it-notes-multicolor-x10',
      description: 'Set de 10 blocks de notas adhesivas en 5 colores neón y pastel, 100 hojas cada uno. Adhesivo removible sin residuos. Tamaño 7.6x7.6 cm. Marca 3M original.',
      price: 24.90, originalPrice: 32.00, stock: 95,
      isNew: false, isFeatured: true,
      imageUrl: img('post-it-multicolor'),
      categoryId: catUniversitario.id, brandId: scotch3m.id,
    }}),
    prisma.product.create({ data: {
      name: 'Lapicero Uni-ball Signo Gel Pack x10',
      slug: 'lapicero-uniball-signo-gel-x10',
      description: 'Pack de 10 lapiceros gel Uni-ball Signo con tinta negra 0.5mm. Escritura suave y fluida de secado rápido. Cuerpo triangular antideslizante para mayor comodidad al escribir.',
      price: 28.90, stock: 85,
      isNew: true, isFeatured: false,
      imageUrl: img('lapicero-uniball-signo'),
      categoryId: catUniversitario.id, brandId: pilot.id,
    }}),

    // ── Oficina [30-35] ───────────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Grapadora de Escritorio Profesional 50 hojas',
      slug: 'grapadora-escritorio-profesional-50',
      description: 'Grapadora de metal resistente con capacidad para 50 hojas. Compatible con grapas N°26/6. Mecanismo doble función: grapado estándar y temporal. Color negro mate.',
      price: 35.00, originalPrice: 45.00, stock: 40,
      isNew: false, isFeatured: false,
      imageUrl: img('grapadora-escritorio'),
      categoryId: catOficina.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Cinta Adhesiva Scotch Transparente Pack x3',
      slug: 'cinta-adhesiva-scotch-transparente-x3',
      description: 'Pack de 3 rollos de cinta Scotch transparente de 19mm x 33m. Resistente al agua y humedad. Ideal para pegar, sellar y reparar documentos. Fácil de arrancar con la mano.',
      price: 12.90, stock: 150,
      isNew: false, isFeatured: false,
      imageUrl: img('cinta-scotch-x3'),
      categoryId: catOficina.id, brandId: scotch3m.id,
    }}),
    prisma.product.create({ data: {
      name: 'Archivador A4 Palanca Lomo Ancho 8cm',
      slug: 'archivador-a4-palanca-lomo-ancho-8cm',
      description: 'Archivador palanca A4 de cartón laminado con lomo de 8cm. Capacidad 600 hojas. Mecanismo de presión antirrotura. Tejuelas y portaetiquetas incluidos. Varios colores.',
      price: 18.90, stock: 80,
      isNew: false, isFeatured: true,
      imageUrl: img('archivador-lomo-ancho'),
      categoryId: catOficina.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Tijeras de Acero Inoxidable 21cm',
      slug: 'tijeras-acero-inoxidable-21cm',
      description: 'Tijeras de oficina con hoja de acero inoxidable templado de 21cm. Mango ergonómico con grip de silicona. Corte limpio y preciso en papel, cartón y tela.',
      price: 14.50, stock: 65,
      isNew: false, isFeatured: false,
      imageUrl: img('tijeras-acero-inoxidable'),
      categoryId: catOficina.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Perforadora de Escritorio 2 Agujeros 30 hojas',
      slug: 'perforadora-escritorio-2-agujeros-30',
      description: 'Perforadora metálica de 2 agujeros con capacidad para 30 hojas. Guía deslizante para centrar el papel automáticamente. Recolector de confeti extraíble. Base antideslizante.',
      price: 29.90, originalPrice: 38.00, stock: 45,
      isNew: false, isFeatured: false,
      imageUrl: img('perforadora-escritorio'),
      categoryId: catOficina.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Dispensador de Cinta de Escritorio Metal',
      slug: 'dispensador-cinta-escritorio-metal',
      description: 'Dispensador de cinta de metal con base antideslizante y cuchilla de acero. Compatible con rollos de 19mm y 25mm. Diseño minimalista para escritorios modernos.',
      price: 22.00, stock: 55,
      isNew: true, isFeatured: false,
      imageUrl: img('dispensador-cinta-escritorio'),
      categoryId: catOficina.id, brandId: scotch3m.id,
    }}),

    // ── Manualidades [36-41] ──────────────────────────────────────────────
    prisma.product.create({ data: {
      name: 'Tijeras de Formas Decorativas Set x6',
      slug: 'tijeras-formas-decorativas-x6',
      description: 'Set de 6 tijeras zigzag con diferentes patrones: ondas, picos, festones, vieiras y más. Ideales para recortar bordes decorativos en scrapbooking y manualidades.',
      price: 19.90, stock: 70,
      isNew: false, isFeatured: false,
      imageUrl: img('tijeras-formas-decorativas'),
      categoryId: catManualidades.id, brandId: maped.id,
    }}),
    prisma.product.create({ data: {
      name: 'Papel Origami 100 hojas 20x20 cm',
      slug: 'papel-origami-100-hojas-20x20',
      description: 'Set de 100 hojas de papel origami en 50 patrones y colores diferentes. Gramaje 60g/m², ideal para doblado preciso. Incluye guía con 30 figuras paso a paso.',
      price: 16.90, stock: 90,
      isNew: true, isFeatured: true, label: 'NUEVO',
      imageUrl: img('papel-origami-100'),
      categoryId: catManualidades.id, brandId: faber.id,
    }}),
    prisma.product.create({ data: {
      name: 'Barras de Silicona Caliente Pack x50',
      slug: 'barras-silicona-caliente-x50',
      description: 'Pack de 50 barras de silicona caliente de 11mm x 20cm. Adhesivo fuerte y de secado rápido. Compatible con pistolas de calor estándar. Transparente y sin grumos.',
      price: 14.90, stock: 120,
      isNew: false, isFeatured: false,
      imageUrl: img('silicona-barra-x50'),
      categoryId: catManualidades.id, brandId: scotch3m.id,
    }}),
    prisma.product.create({ data: {
      name: 'Cartulina de Colores A3 Pack x20 hojas',
      slug: 'cartulina-colores-a3-x20',
      description: 'Pack de 20 cartulinas A3 en 10 colores brillantes. Gramaje 220g/m², resistente y no se dobla fácilmente. Ideal para manualidades, presentaciones y decoraciones.',
      price: 11.90, stock: 130,
      isNew: false, isFeatured: false,
      imageUrl: img('cartulina-colores-a3'),
      categoryId: catManualidades.id, brandId: faber.id,
    }}),
    prisma.product.create({ data: {
      name: 'Washi Tape Decorativo Set x10 rollos',
      slug: 'washi-tape-decorativo-x10',
      description: 'Set de 10 rollos de washi tape 15mm x 10m. Diseños florales, geométricos y vintage. Adhesivo removible que no daña superficies. Para cuadernos, regalos y decoración.',
      price: 22.90, originalPrice: 30.00, stock: 85,
      isNew: true, isFeatured: true, label: 'TENDENCIA',
      imageUrl: img('washi-tape-set-x10'),
      categoryId: catManualidades.id, brandId: scotch3m.id,
    }}),
    prisma.product.create({ data: {
      name: 'Foamy de Colores A4 Pack x10 hojas',
      slug: 'foamy-colores-a4-x10',
      description: 'Pack de 10 hojas de foamy A4 en 10 colores surtidos. Grosor 2mm, superficie lisa y textura suave. Fácil de cortar, pegar y pintar. Ideal para manualidades escolares.',
      price: 13.90, stock: 100,
      isNew: false, isFeatured: false,
      imageUrl: img('foamy-colores-a4'),
      categoryId: catManualidades.id, brandId: crayola.id,
    }}),
  ])

  // ── Usuario demo ───────────────────────────────────────────────────────────
  console.log('Creando usuario demo...')
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const ana = await prisma.user.create({
    data: { name: 'Ana García', email: 'ana@demo.com', passwordHash },
  })

  const address = await prisma.address.create({
    data: {
      label: 'Casa',
      street: 'Calle de los Útiles 456',
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
      total: 75.00,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2025-02-10'),
      items: { create: [{ quantity: 1, unitPrice: 75.00, productId: products[6].id }] },
    },
  })

  await prisma.order.create({
    data: {
      status: 'SHIPPED',
      total: 57.30,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2025-03-15'),
      items: {
        create: [
          { quantity: 1, unitPrice: 22.90, productId: products[22].id },
          { quantity: 2, unitPrice: 14.90, productId: products[26].id },
          { quantity: 1, unitPrice: 4.60,  productId: products[23].id },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      status: 'PENDING',
      total: 136.90,
      userId: ana.id,
      addressId: address.id,
      createdAt: new Date('2025-05-20'),
      items: {
        create: [
          { quantity: 1, unitPrice: 65.00, productId: products[13].id },
          { quantity: 1, unitPrice: 42.00, productId: products[12].id },
          { quantity: 1, unitPrice: 29.90, productId: products[34].id },
        ],
      },
    },
  })

  console.log('✓ Seed completado:')
  console.log('  • 7 categorías: juguetería, tecnología, arte y diseño, escolar, universitario, oficina, manualidades')
  console.log('  • 10 marcas')
  console.log(`  • ${products.length} productos (6 por categoría)`)
  console.log('  • 1 usuario demo → ana@demo.com / demo1234')
  console.log('  • 3 órdenes demo')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
