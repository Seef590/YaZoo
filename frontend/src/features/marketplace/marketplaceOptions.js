export const animalCategoryOptions = [
  { value: '', label: 'Toutes les categories' },
  { value: 'dog', label: 'Chiens' },
  { value: 'cat', label: 'Chats' },
  { value: 'bird', label: 'Oiseaux' },
  { value: 'fish', label: 'Poissons' },
  { value: 'rabbit', label: 'Lapins' },
  { value: 'reptile', label: 'Reptiles' },
  { value: 'other', label: 'Autres' },
]

export const animalFormCategoryOptions = animalCategoryOptions.filter(
  (option) => option.value !== '',
)

export const animalStatusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reserve' },
  { value: 'adopted', label: 'Adopte' },
  { value: 'sold', label: 'Vendu' },
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
  { value: '', label: 'Toutes les categories' },
  { value: 'food', label: 'Alimentation' },
  { value: 'toy', label: 'Jouets' },
  { value: 'accessory', label: 'Accessoires' },
  { value: 'hygiene', label: 'Hygiene' },
  { value: 'health', label: 'Sante' },
  { value: 'habitat', label: 'Habitat' },
  { value: 'other', label: 'Autres' },
]

export const productFormCategoryOptions = productCategoryOptions.filter(
  (option) => option.value !== '',
)

export const productStatusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reserve' },
  { value: 'sold', label: 'Vendu' },
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
