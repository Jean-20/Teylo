import { create } from 'zustand'

const useWishlistStore = create((set, get) => ({
  productIds: new Set(),

  setFromApi: (items) =>
    set({ productIds: new Set(items.map((i) => i.productId)) }),

  toggle: (productId) => {
    const ids = new Set(get().productIds)
    if (ids.has(productId)) ids.delete(productId)
    else ids.add(productId)
    set({ productIds: ids })
  },

  isWishlisted: (productId) => get().productIds.has(productId),

  clear: () => set({ productIds: new Set() }),
}))

export default useWishlistStore
