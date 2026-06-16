import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,

  setItems: (items) =>
    set({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    }),

  incrementCount: () => set((s) => ({ itemCount: s.itemCount + 1 })),

  decrementCount: () => set((s) => ({ itemCount: Math.max(0, s.itemCount - 1) })),

  clearCart: () => set({ items: [], itemCount: 0 }),
}))

export default useCartStore
