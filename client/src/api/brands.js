import api from './axios.js'

export const getBrands = () => api.get('/brands')
