import {
  createProductRequest,
  deleteProductRequest,
  getProductsRequest,
  updateProductRequest,
} from '../../api/products'
import { cleanFilters } from '../../features/marketplace/marketplaceUtils'

export async function fetchProducts(filters = {}) {
  const response = await getProductsRequest(cleanFilters(filters))

  return response.data.data ?? []
}

export function createProduct(payload) {
  return createProductRequest(payload)
}

export function updateProduct(productId, payload) {
  return updateProductRequest(productId, payload)
}

export function deleteProduct(productId) {
  return deleteProductRequest(productId)
}
