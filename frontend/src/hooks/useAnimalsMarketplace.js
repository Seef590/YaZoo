import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { defaultAnimalFilters, defaultAnimalForm } from '../features/marketplace/marketplaceOptions'
import {
  buildAnimalFormData,
  countActiveFilters,
  uniqueUrls,
} from '../features/marketplace/marketplaceUtils'
import * as animalService from '../services/marketplace/animalsMarketplaceService'
import { asArray } from '../utils/apiData'
import { getErrorMessage } from '../utils/getErrorMessage'

const cloneAnimalForm = () => ({
  ...defaultAnimalForm,
  existing_gallery_paths: [],
  existing_gallery_urls: [],
})

export function useAnimalsMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [animals, setAnimals] = useState([])
  const [filters, setFilters] = useState(() => ({
    ...defaultAnimalFilters,
    q: queryFromUrl,
  }))
  const [form, setForm] = useState(cloneAnimalForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const loadAnimals = useCallback(async (activeFilters = filters) => {
    try {
      const nextAnimals = await animalService.fetchAnimals(activeFilters)

      setAnimals(nextAnimals)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de charger les annonces animaliers.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let cancelled = false

    const loadInitialAnimals = async () => {
      try {
        const nextAnimals = await animalService.fetchAnimals()

        if (!cancelled) {
          setAnimals(nextAnimals)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, 'Impossible de charger les annonces animaliers.'),
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadInitialAnimals()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setFilters((current) => {
      if (current.q === queryFromUrl) {
        return current
      }

      return { ...current, q: queryFromUrl }
    })

    setIsLoading(true)
    void loadAnimals({ ...filters, q: queryFromUrl })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl])

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleFormChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value

    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(cloneAnimalForm())
    setPhotoFile(null)
    setGalleryFiles([])
    setEditingId(null)
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    if (filters.q.trim()) {
      setSearchParams({ q: filters.q.trim() })
    } else {
      setSearchParams({})
    }
    setIsLoading(true)
    await loadAnimals(filters)
  }

  const handleResetFilters = async () => {
    setFilters(defaultAnimalFilters)
    setSearchParams({})
    setIsLoading(true)
    await loadAnimals(defaultAnimalFilters)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const payload = buildAnimalFormData(form, photoFile, galleryFiles)

      if (editingId) {
        await animalService.updateAnimal(editingId, payload)
        setSuccessMessage('Annonce animal mise a jour.')
      } else {
        await animalService.createAnimal(payload)
        setSuccessMessage('Annonce animal creee avec succes.')
      }

      resetForm()
      await loadAnimals(filters)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'enregistrer l'annonce animal."),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (animal) => {
    setEditingId(animal.id)
    setPhotoFile(null)
    setGalleryFiles([])
    setForm({
      ...cloneAnimalForm(),
      name: animal.name ?? '',
      category: animal.category ?? 'other',
      type: animal.type ?? '',
      breed: animal.breed ?? '',
      age: animal.age ?? '',
      sex: animal.sex ?? 'unknown',
      location: animal.location ?? '',
      price: animal.price ?? '',
      is_for_adoption: animal.isForAdoption ?? false,
      listing_status: animal.listingStatus ?? 'available',
      description: animal.description ?? '',
      existing_photo_path: animal.photoPath ?? '',
      existing_photo_url: animal.photoUrl ?? '',
      existing_gallery_paths: animal.galleryPaths ?? [],
      existing_gallery_urls: animal.galleryUrls ?? [],
    })
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleDelete = async (animalId) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await animalService.deleteAnimal(animalId)
      setAnimals((current) => asArray(current).filter((animal) => animal.id !== animalId))
      if (editingId === animalId) resetForm()
      setSuccessMessage('Annonce animal supprimee.')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de supprimer l'annonce animal."),
      )
    }
  }

  return {
    animals,
    filters,
    form,
    galleryFiles,
    photoFile,
    editingId,
    errorMessage,
    successMessage,
    isLoading,
    isSubmitting,
    isFiltersOpen,
    activeFiltersCount: countActiveFilters(filters),
    existingPreviewUrls: uniqueUrls([form.existing_photo_url, ...form.existing_gallery_urls]),
    setGalleryFiles,
    setPhotoFile,
    setIsFiltersOpen,
    handleDelete,
    handleEdit,
    handleFilterChange,
    handleFormChange,
    handleResetFilters,
    handleSearch,
    handleSubmit,
    resetForm,
  }
}
