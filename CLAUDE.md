# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reglas de trabajo

- Piensa antes de actuar. Lee los archivos antes de escribir código.
- Edita solo lo que cambia, no reescribas archivos enteros.
- No releas archivos que ya hayas leído salvo que hayan cambiado.
- No repitas código sin cambios en tus respuestas.
- Sin preámbulos, sin resúmenes al final, sin explicar lo obvio.
- Testea antes de dar por terminado.

## Comandos

### Client (`client/`)
```bash
pnpm dev        # Vite dev server en http://localhost:5173
pnpm build      # Build de producción
pnpm preview    # Preview del build
```

### Server (`server/`)
```bash
pnpm dev            # nodemon (hot reload)
pnpm start          # Node directo
pnpm db:migrate     # prisma migrate dev
pnpm db:seed        # Ejecuta prisma/seed.js
pnpm db:studio      # Prisma Studio
```

## Variables de entorno

**`client/.env`** (copiar de `client/.env.example`):
- `VITE_API_URL` — URL base del backend (default: `http://localhost:3001/api`)
- `VITE_IMAGE_BASE_URL` — Prefijo de imágenes (vacío en local; Cloudinary en producción)

**`server/.env`** (copiar de `server/.env.example`):
- `DATABASE_URL` — Neon PostgreSQL pooled (para queries)
- `DIRECT_URL` — Neon PostgreSQL direct (solo para migraciones)
- `JWT_SECRET` — Secreto para firmar tokens
- `PORT` — Default `3001`

## Arquitectura

Monorepo con dos apps independientes: `client/` y `server/`. No hay workspace pnpm; cada una se instala y corre por separado.

### Server — Express + Prisma

- **Entrada**: `server/src/index.js` — registra CORS (solo `localhost:5173`), parsea JSON, monta todas las rutas bajo `/api/*`.
- **Rutas**: cada archivo en `server/src/routes/` es un `Router` de Express. Las rutas protegidas usan `authMiddleware` de `server/src/middleware/auth.js`.
- **Auth**: JWT Bearer. El middleware extrae `userId` del token y lo pone en `req.user`. El token dura 7 días.
- **DB**: Prisma Client singleton en `server/src/lib/prisma.js`. La base es Neon PostgreSQL. Usa `DATABASE_URL` (pooled/PgBouncer) para queries y `DIRECT_URL` para migraciones.
- **Respuestas API**: éxito → `{ data: ..., message?: ... }`, error → `{ error: "..." }`.

### Client — React + Vite

- **Entrada**: `client/src/main.jsx` → `App.jsx` que configura el router.
- **Routing**: React Router v6. Rutas sin layout (Login, Register), rutas con `<Layout>` (Navbar + Footer), y rutas protegidas con `<ProtectedRoute>` que redirige a `/login` si no hay sesión.
- **HTTP**: instancia de axios en `client/src/api/axios.js` con `baseURL = VITE_API_URL`. Interceptor añade `Authorization: Bearer <token>` desde `localStorage` automáticamente.
- **Estado global**: Zustand. Tres stores:
  - `authStore` — usuario, token (persiste en `localStorage`), `isAuthenticated`
  - `cartStore` — items y `itemCount`; se carga desde la API en `App.jsx` al iniciar sesión
  - `wishlistStore` — ídem wishlist
- **Imágenes**: siempre pasar la URL por `getImageUrl(path)` (`client/src/utils/getImageUrl.js`), que antepone `VITE_IMAGE_BASE_URL`.
- **Estilos**: Tailwind CSS v3.

### Modelo de datos (Prisma)

Entidades principales: `User`, `Product`, `Category` (árbol recursivo `parent/children`), `Brand`, `Order` (con `OrderStatus` enum), `CartItem`, `Wishlist`, `Address`, `Review`, `ProductImage`.
