import api from './axios.js'

export const getCart        = ()              => api.get('/cart')
export const addToCart      = (productId, qty = 1) => api.post('/cart/items', { productId, quantity: qty })
export const updateCartItem = (id, quantity)  => api.put(`/cart/items/${id}`, { quantity })
export const removeCartItem = (id)            => api.delete(`/cart/items/${id}`)
export const clearCart      = ()              => api.delete('/cart')
