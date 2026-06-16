import api from './axios.js'

export const searchProducts = (q) => api.get('/search', { params: { q } })
