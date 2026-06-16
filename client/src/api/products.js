import api from './axios.js'

export const getFeaturedProducts = () =>
  api.get('/products/featured')

export const getProducts = (params) =>
  api.get('/products', { params })

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`)
