import api from './axios.js'

export const getOrders   = ()          => api.get('/orders')
export const getOrder    = (id)        => api.get(`/orders/${id}`)
export const createOrder = (addressId) => api.post('/orders', { addressId })
