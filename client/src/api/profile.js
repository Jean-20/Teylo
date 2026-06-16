import api from './axios.js'

export const getProfile       = ()        => api.get('/profile')
export const updateProfile    = (data)    => api.put('/profile', data)
export const changePassword   = (data)    => api.put('/profile/password', data)
export const getAddresses     = ()        => api.get('/profile/addresses')
export const createAddress    = (data)    => api.post('/profile/addresses', data)
export const updateAddress    = (id, data)=> api.put(`/profile/addresses/${id}`, data)
export const deleteAddress    = (id)      => api.delete(`/profile/addresses/${id}`)
