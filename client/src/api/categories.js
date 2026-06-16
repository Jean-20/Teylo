import api from './axios.js'

export const getCategories = () =>
  api.get('/categories')

export const getCategoryBySlug = (slug) =>
  api.get(`/categories/${slug}`)
