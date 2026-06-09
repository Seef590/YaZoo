export function cleanFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  )
}

export function uniqueUrls(urls) {
  return [...new Set(urls.filter(Boolean))]
}

export function countActiveFilters(filters) {
  return Object.values(filters).filter((value) => value !== '').length
}

export function formatFiltersSummary(activeFiltersCount) {
  if (activeFiltersCount === 0) {
    return 'Aucun filtre actif'
  }

  return `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`
}

export function buildAnimalFormData(form, photoFile, galleryFiles) {
  const formData = new FormData()

  formData.append('name', form.name)
  formData.append('category', form.category)
  formData.append('type', form.type)
  formData.append('breed', form.breed)
  formData.append('sex', form.sex)
  formData.append('location', form.location)
  formData.append('is_for_adoption', form.is_for_adoption ? '1' : '0')
  formData.append('listing_status', form.listing_status)
  formData.append('description', form.description)

  if (form.age !== '') formData.append('age', String(form.age))
  if (form.price !== '') formData.append('price', String(form.price))
  if (form.existing_photo_path) formData.append('photo_url', form.existing_photo_path)

  ;(form.existing_gallery_paths ?? []).forEach((path) => {
    formData.append('gallery_urls[]', path)
  })

  if (photoFile) formData.append('photo', photoFile)
  galleryFiles.forEach((file) => formData.append('gallery_files[]', file))

  return formData
}

export function buildProductFormData(form, imageFile, galleryFiles) {
  const formData = new FormData()

  formData.append('name', form.name)
  formData.append('category', form.category)
  formData.append('description', form.description)
  formData.append('price', String(form.price))
  formData.append('location', form.location)
  formData.append('stock', String(form.stock))
  formData.append('listing_status', form.listing_status)
  formData.append('condition_status', form.condition_status)

  if (form.existing_image_path) formData.append('image_url', form.existing_image_path)

  ;(form.existing_gallery_paths ?? []).forEach((path) => {
    formData.append('gallery_urls[]', path)
  })

  if (imageFile) formData.append('image', imageFile)
  galleryFiles.forEach((file) => formData.append('gallery_files[]', file))

  return formData
}

export function buildAnimalContactPath(animal) {
  const message = `Bonjour, je vous contacte a propos de votre annonce "${animal.name}". Est-elle toujours disponible ?`

  return `/messages?email=${encodeURIComponent(animal.author.email)}&message=${encodeURIComponent(message)}`
}

export function buildProductContactPath(product) {
  const message = `Bonjour, je vous contacte a propos de votre produit "${product.name}". Est-il toujours disponible ?`

  return `/messages?email=${encodeURIComponent(product.author.email)}&message=${encodeURIComponent(message)}`
}

export function formatAnimalCategory(category) {
  const labels = {
    dog: 'Chiens',
    cat: 'Chats',
    bird: 'Oiseaux',
    fish: 'Poissons',
    rabbit: 'Lapins',
    reptile: 'Reptiles',
    other: 'Autres',
  }

  return labels[category] ?? 'Autres'
}

export function formatAnimalStatus(status) {
  const labels = {
    available: 'Disponible',
    reserved: 'Reserve',
    adopted: 'Adopte',
    sold: 'Vendu',
  }

  return labels[status] ?? 'Disponible'
}

export function formatAnimalSex(sex) {
  const labels = {
    male: 'Male',
    female: 'Femelle',
    unknown: 'Inconnu',
  }

  return labels[sex] ?? 'Inconnu'
}

export function formatProductCategory(category) {
  const labels = {
    food: 'Alimentation',
    toy: 'Jouets',
    accessory: 'Accessoires',
    hygiene: 'Hygiene',
    health: 'Sante',
    habitat: 'Habitat',
    other: 'Autres',
  }

  return labels[category] ?? 'Autres'
}

export function formatProductStatus(status) {
  const labels = {
    available: 'Disponible',
    reserved: 'Reserve',
    sold: 'Vendu',
  }

  return labels[status] ?? 'Disponible'
}

export function formatCondition(conditionStatus) {
  return conditionStatus === 'used' ? 'Occasion' : 'Neuf'
}
