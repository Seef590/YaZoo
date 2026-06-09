import api from './client'

export const getAnimalsRequest = (params = {}) =>
  api.get('/animals', { params })

export const getAnimalRequest = (animalId) => api.get(`/animals/${animalId}`)

export const createAnimalRequest = (payload) => api.post('/animals', payload)

export const updateAnimalRequest = (animalId, payload) => {
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    payload.append('_method', 'PUT')

    return api.post(`/animals/${animalId}`, payload)
  }

  return api.put(`/animals/${animalId}`, payload)
}

export const deleteAnimalRequest = (animalId) => api.delete(`/animals/${animalId}`)
