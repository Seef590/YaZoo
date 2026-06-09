import {
  createAnimalRequest,
  deleteAnimalRequest,
  getAnimalsRequest,
  updateAnimalRequest,
} from '../../api/animals'
import { cleanFilters } from '../../features/marketplace/marketplaceUtils'

export async function fetchAnimals(filters = {}) {
  const response = await getAnimalsRequest(cleanFilters(filters))

  return response.data.data ?? []
}

export function createAnimal(payload) {
  return createAnimalRequest(payload)
}

export function updateAnimal(animalId, payload) {
  return updateAnimalRequest(animalId, payload)
}

export function deleteAnimal(animalId) {
  return deleteAnimalRequest(animalId)
}
