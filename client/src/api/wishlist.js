import api from './axios.js'

export const getWishlist     = ()          => api.get('/wishlist')
export const toggleWishlist  = (productId) => api.post('/wishlist', { productId })
