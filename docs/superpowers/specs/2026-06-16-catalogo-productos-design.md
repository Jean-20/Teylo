# Diseño: Rediseño Catálogo y Productos

**Fecha:** 2026-06-16
**Estado:** Aprobado

## Contexto

Las páginas `/categorias` (Catalogo.jsx) y `/productos` (Productos.jsx) tenían el mismo esqueleto visual: sidebar + grid de ProductCard. No había diferencia de propósito ni experiencia. Se rediseñan para darle a cada una un rol claro en el journey de compra.

---

## Flujo esperado

```
Home → /categorias (explorar por categoría) → /productos?category=slug (filtrar y comprar)
```

---

## 1. `/categorias` — Catálogo (Descubrimiento)

**Propósito:** El usuario llega sin saber qué quiere. Lo orientamos visualmente.

### Layout

- **Sidebar izquierdo fijo** — lista de categorías **padre** (las que tienen `parentId: null`) con imagen (`imageUrl`) y contador de productos (`_count.products`). Al hacer clic en una, se activa y muestra sus productos a la derecha.
- **Área derecha** — grid de productos (`2 cols en sm, 3 en lg`) de la categoría activa. Al entrar sin categoría seleccionada, se muestra la primera por defecto.
- **Sin filtros de precio ni marca** — eso es responsabilidad de `/productos`. Aquí solo se navega por categoría.
- **Título dinámico** — muestra el nombre de la categoría activa y un subtítulo descriptivo.
- **Botón CTA en cada categoría del sidebar** — "Ver todos" que lleva a `/productos?category=<slug>` con todos los filtros disponibles.

### Datos

- `getCategories()` para poblar el sidebar (filtrar `parentId === null`).
- `getProducts({ category: slug, limit: 9 })` al seleccionar una categoría.
- Sin paginación en esta vista — se muestra un máximo de 9 y hay CTA para ver todos.

---

## 2. `/productos` — Productos (Decisión de compra)

**Propósito:** El usuario sabe qué busca. Necesita filtrar, comparar y decidir.

### Layout

- **Sidebar izquierdo** — misma estructura visual que en Catálogo para consistencia:
  - Filtro de **marca** (radio buttons, igual que hoy)
  - Filtro de **precio máximo** (slider, igual que hoy)
  - Filtro de **rating mínimo** (estrellas, igual que hoy)
  - Botón "Limpiar filtros"
- **Chips de filtros activos** — fila de tags removibles encima del contenido (`Marca: Muji ×`, `Precio: hasta S/200 ×`, `Rating: ★★★★ y más ×`). Solo aparece si hay al menos un filtro activo.
- **Toggle vista** — botones ⊞ / ≡ arriba a la derecha para cambiar entre cuadrícula y lista. **Vista lista es el default.**
- **Vista cuadrícula** — grid de `ProductCard` estándar (igual que hoy).
- **Vista lista** — filas horizontales: imagen pequeña (60×60) + marca + nombre + rating + precio + botón de carrito.

### Estado de vista

- El toggle cuadrícula/lista es estado local (`useState`), no va a la URL.

---

## 3. `ProductCard` — Mejoras

Aplicadas en ambas páginas (cuadrícula). La vista lista de Productos usa su propio markup inline.

### Elementos nuevos

| Elemento | Dónde | Condición |
|---|---|---|
| Badge `-X%` rojo | Sobre imagen, arriba izquierda | Solo si `originalPrice > price` |
| Nombre de marca | Encima del nombre, gris pequeño | Solo si `brand?.name` existe |
| Rating ★ + (N) | Bajo el nombre | Solo si `reviewCount > 0` |
| Precio en color primario | Reemplaza el gris actual | Siempre |

### Badge de descuento

```js
const discount = Math.round((1 - price / originalPrice) * 100)
// Mostrar si discount >= 5
```

### Compatibilidad

- `showDescription` prop se elimina — ya no se usa en ninguna de las dos páginas.
- El badge "Nuevo" (`isNew`) se mantiene arriba derecha.
- El badge de categoría (`category.name`) se mantiene abajo izquierda.
- El corazón de wishlist se mantiene arriba izquierda — se mueve para dejar espacio al badge de descuento: el badge va arriba izquierda solo cuando hay descuento, el corazón se mueve a arriba derecha junto al badge "Nuevo" en ese caso.

---

## 4. Lo que NO cambia

- `Pagination.jsx` — se usa igual en `/productos`
- Lógica de carrito y wishlist en `ProductCard`
- Stores de Zustand
- Endpoints de la API
- Navbar y Layout

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `client/src/pages/Catalogo.jsx` | Reescritura completa del layout |
| `client/src/pages/Productos.jsx` | Agregar chips, toggle lista/cuadrícula |
| `client/src/components/ui/ProductCard.jsx` | Badge descuento, marca, rating |
