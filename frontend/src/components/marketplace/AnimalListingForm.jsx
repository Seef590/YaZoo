import PropTypes from 'prop-types'

import Button from '../ui/Button'
import { Field, FileField, SelectField } from './MarketplaceCommon'
import { animalFormCategoryOptions, animalFormStatusOptions } from '../../features/marketplace/marketplaceOptions'

function AnimalListingForm({
  form,
  editingId,
  isSubmitting,
  photoFile,
  galleryFiles,
  existingPreviewUrls,
  onCancelEdit,
  onFormChange,
  onGalleryFilesChange,
  onPhotoFileChange,
  onSubmit,
}) {
  const submitLabel = getSubmitLabel(isSubmitting, editingId)

  return (
    <form onSubmit={onSubmit} className="rounded-[30px] border border-white/80 bg-white/92 p-4 shadow-[0_20px_48px_rgba(124,58,237,0.08)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-700">Publication</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">
            {editingId ? "Modifier l'annonce" : 'Creer une annonce animal'}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Donnez envie de vous contacter avec une presentation claire, soignee et rassurante.
          </p>
        </div>

        {editingId ? (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>Annuler la modification</Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Nom" value={form.name} onChange={onFormChange('name')} />
        <SelectField label="Categorie" value={form.category} onChange={onFormChange('category')} options={animalFormCategoryOptions} />
        <Field label="Type" value={form.type} onChange={onFormChange('type')} />
        <Field label="Race" value={form.breed} onChange={onFormChange('breed')} />
        <Field label="Age" type="number" min="0" value={form.age} onChange={onFormChange('age')} />
        <SelectField
          label="Sexe"
          value={form.sex}
          onChange={onFormChange('sex')}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Femelle' },
            { value: 'unknown', label: 'Inconnu' },
          ]}
        />
        <Field label="Localisation" value={form.location} onChange={onFormChange('location')} />
        <Field label="Prix" type="number" min="0" step="0.01" value={form.price} onChange={onFormChange('price')} />
        <SelectField label="Statut de l'annonce" value={form.listing_status} onChange={onFormChange('listing_status')} options={animalFormStatusOptions} />
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={form.is_for_adoption}
          onChange={onFormChange('is_for_adoption')}
          className="h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-400"
        />
        Cette annonce concerne une adoption
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FileField label="Image principale" accept="image/*" onChange={(event) => onPhotoFileChange(event.target.files?.[0] ?? null)} />
        <FileField label="Galerie d'images" accept="image/*" multiple onChange={(event) => onGalleryFilesChange(Array.from(event.target.files ?? []))} />
      </div>

      <SelectedFiles photoFile={photoFile} galleryFiles={galleryFiles} />
      <ExistingImages urls={existingPreviewUrls} />

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-stone-700">Description</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={onFormChange('description')}
          className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
          placeholder="Caractere, vaccins, besoins, disponibilite..."
        />
      </label>

      <div className="mt-4 flex justify-stretch sm:justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function SelectedFiles({ photoFile, galleryFiles }) {
  return (
    <>
      {photoFile ? <p className="mt-3 text-sm text-stone-500">Image principale selectionnee: {photoFile.name}</p> : null}
      {galleryFiles.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {galleryFiles.map((file) => (
            <span key={`${file.name}-${file.size}`} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
              {file.name}
            </span>
          ))}
        </div>
      ) : null}
    </>
  )
}

function ExistingImages({ urls }) {
  if (urls.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-stone-700">Images actuelles</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {urls.map((imageUrl) => (
          <img key={imageUrl} src={imageUrl} alt="Apercu" className="h-20 w-20 rounded-2xl object-cover" />
        ))}
      </div>
    </div>
  )
}

function getSubmitLabel(isSubmitting, editingId) {
  if (isSubmitting) {
    return 'Enregistrement...'
  }

  if (editingId) {
    return "Mettre a jour l'annonce"
  }

  return "Publier l'annonce"
}

AnimalListingForm.propTypes = {
  form: PropTypes.object,
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSubmitting: PropTypes.bool,
  photoFile: PropTypes.object,
  galleryFiles: PropTypes.array,
  existingPreviewUrls: PropTypes.array,
  onCancelEdit: PropTypes.func,
  onFormChange: PropTypes.func,
  onGalleryFilesChange: PropTypes.func,
  onPhotoFileChange: PropTypes.func,
  onSubmit: PropTypes.func,
}

SelectedFiles.propTypes = {
  photoFile: PropTypes.object,
  galleryFiles: PropTypes.array,
}

ExistingImages.propTypes = {
  urls: PropTypes.array,
}

export default AnimalListingForm
