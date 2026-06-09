import PropTypes from 'prop-types'

import Button from '../ui/Button'
import { Field, FileField, SelectField } from './MarketplaceCommon'
import { productFormCategoryOptions, productFormStatusOptions } from '../../features/marketplace/marketplaceOptions'

function ProductListingForm({
  form,
  editingId,
  isSubmitting,
  imageFile,
  galleryFiles,
  existingPreviewUrls,
  onCancelEdit,
  onFormChange,
  onGalleryFilesChange,
  onImageFileChange,
  onSubmit,
}) {
  const submitLabel = getSubmitLabel(isSubmitting, editingId)

  return (
    <form onSubmit={onSubmit} className="rounded-[30px] border border-white/80 bg-white/92 p-4 shadow-[0_20px_48px_rgba(124,58,237,0.08)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-700">Publication</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">
            {editingId ? 'Modifier le produit' : 'Creer un produit'}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Mettez votre offre en valeur avec une fiche produit plus soignee et plus convaincante.
          </p>
        </div>

        {editingId ? (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>Annuler la modification</Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Nom" value={form.name} onChange={onFormChange('name')} />
        <SelectField label="Categorie" value={form.category} onChange={onFormChange('category')} options={productFormCategoryOptions} />
        <Field label="Prix" type="number" min="0" step="0.01" value={form.price} onChange={onFormChange('price')} />
        <Field label="Localisation" value={form.location} onChange={onFormChange('location')} />
        <Field label="Stock" type="number" min="0" value={form.stock} onChange={onFormChange('stock')} />
        <SelectField label="Statut de l'annonce" value={form.listing_status} onChange={onFormChange('listing_status')} options={productFormStatusOptions} />
        <SelectField
          label="Etat"
          value={form.condition_status}
          onChange={onFormChange('condition_status')}
          options={[
            { value: 'new', label: 'Neuf' },
            { value: 'used', label: 'Occasion' },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FileField label="Image principale" accept="image/*" onChange={(event) => onImageFileChange(event.target.files?.[0] ?? null)} />
        <FileField label="Galerie d'images" accept="image/*" multiple onChange={(event) => onGalleryFilesChange(Array.from(event.target.files ?? []))} />
      </div>

      <SelectedFiles imageFile={imageFile} galleryFiles={galleryFiles} />
      <ExistingImages urls={existingPreviewUrls} />

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-stone-700">Description</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={onFormChange('description')}
          className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
          placeholder="Materiaux, usage, dimensions, etat du produit..."
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

function SelectedFiles({ imageFile, galleryFiles }) {
  return (
    <>
      {imageFile ? <p className="mt-3 text-sm text-stone-500">Image principale selectionnee: {imageFile.name}</p> : null}
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
    return 'Mettre a jour le produit'
  }

  return 'Publier le produit'
}

ProductListingForm.propTypes = {
  form: PropTypes.object,
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSubmitting: PropTypes.bool,
  imageFile: PropTypes.object,
  galleryFiles: PropTypes.array,
  existingPreviewUrls: PropTypes.array,
  onCancelEdit: PropTypes.func,
  onFormChange: PropTypes.func,
  onGalleryFilesChange: PropTypes.func,
  onImageFileChange: PropTypes.func,
  onSubmit: PropTypes.func,
}

SelectedFiles.propTypes = {
  imageFile: PropTypes.object,
  galleryFiles: PropTypes.array,
}

ExistingImages.propTypes = {
  urls: PropTypes.array,
}

export default ProductListingForm
