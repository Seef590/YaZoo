export const animalCategoryOptions = [
  { value: '', labelKey: 'animals.labels.allCategories' },
  { value: 'dog', labelKey: 'animals.labels.dog' },
  { value: 'cat', labelKey: 'animals.labels.cat' },
  { value: 'bird', labelKey: 'animals.labels.bird' },
  { value: 'fish', labelKey: 'animals.labels.fish' },
  { value: 'rabbit', labelKey: 'animals.labels.rabbit' },
  { value: 'reptile', labelKey: 'animals.labels.reptile' },
  { value: 'other', labelKey: 'animals.labels.other' },
]

export const animalFormCategoryOptions = animalCategoryOptions.filter(
  (option) => option.value !== '',
)

export const animalStatusOptions = [
  { value: '', labelKey: 'animals.labels.allStatuses' },
  { value: 'available', labelKey: 'animals.labels.available' },
  { value: 'reserved', labelKey: 'animals.labels.reserved' },
  { value: 'adopted', labelKey: 'animals.labels.adopted' },
  { value: 'sold', labelKey: 'animals.labels.sold' },
]

export const animalFormStatusOptions = animalStatusOptions.filter(
  (option) => option.value !== '',
)

export const defaultAnimalForm = {
  name: '',
  category: 'other',
  type: '',
  breed: '',
  age: '',
  sex: 'unknown',
  location: '',
  price: '',
  is_for_adoption: false,
  listing_status: 'available',
  description: '',
  existing_photo_path: '',
  existing_photo_url: '',
  existing_gallery_paths: [],
  existing_gallery_urls: [],
}

export const defaultAnimalFilters = {
  q: '',
  category: '',
  type: '',
  sex: '',
  location: '',
  listing_status: '',
  adoption: '',
  min_price: '',
  max_price: '',
}

export const productCategoryOptions = [
  { value: '', labelKey: 'products.labels.allCategories' },
  { value: 'food', labelKey: 'products.labels.food' },
  { value: 'toy', labelKey: 'products.labels.toy' },
  { value: 'accessory', labelKey: 'products.labels.accessory' },
  { value: 'hygiene', labelKey: 'products.labels.hygiene' },
  { value: 'health', labelKey: 'products.labels.health' },
  { value: 'habitat', labelKey: 'products.labels.habitat' },
  { value: 'other', labelKey: 'products.labels.other' },
]

export const productFormCategoryOptions = productCategoryOptions.filter(
  (option) => option.value !== '',
)

export const productStatusOptions = [
  { value: '', labelKey: 'products.labels.allStatuses' },
  { value: 'available', labelKey: 'products.labels.available' },
  { value: 'reserved', labelKey: 'products.labels.reserved' },
  { value: 'sold', labelKey: 'products.labels.sold' },
]

export const productFormStatusOptions = productStatusOptions.filter(
  (option) => option.value !== '',
)

export const defaultProductForm = {
  name: '',
  category: 'other',
  description: '',
  price: '',
  location: '',
  stock: 1,
  listing_status: 'available',
  condition_status: 'new',
  existing_image_path: '',
  existing_image_url: '',
  existing_gallery_paths: [],
  existing_gallery_urls: [],
}

export const defaultProductFilters = {
  q: '',
  category: '',
  min_price: '',
  max_price: '',
  location: '',
  listing_status: '',
  condition_status: '',
}
