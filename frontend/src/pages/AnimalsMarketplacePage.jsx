import animalFamilyImage from '../assets/images/cute-animals-group-white-background-removebg-preview.webp'
import AnimalCard from '../components/marketplace/AnimalCard'
import AnimalListingForm from '../components/marketplace/AnimalListingForm'
import AnimalsFilters from '../components/marketplace/AnimalsFilters'
import { MarketplaceHero } from '../components/marketplace/MarketplaceCommon'
import { useAnimalsMarketplace } from '../hooks/useAnimalsMarketplace'

function AnimalsMarketplacePage() {
  const marketplace = useAnimalsMarketplace()

  return (
    <section className="space-y-6">
      <MarketplaceHero
        active="animals"
        title="Decouvrez, publiez et valorisez des annonces animales dans un espace plus desirant."
        description="YaZoo met les animaux en avant avec une lecture plus douce, des cartes plus vivantes et un parcours plus rassurant pour vendre, adopter ou entrer en contact."
        imageSrc={animalFamilyImage}
        imageAlt="Illustration animale du marketplace YaZoo."
        imageClass="mx-auto h-24 w-auto object-contain sm:h-28"
        stats={[
          { label: 'Annonces visibles', value: marketplace.animals.length },
          { label: 'Filtres actifs', value: marketplace.activeFiltersCount },
        ]}
      />

      <AnimalsFilters
        filters={marketplace.filters}
        activeFiltersCount={marketplace.activeFiltersCount}
        isOpen={marketplace.isFiltersOpen}
        onToggle={() => marketplace.setIsFiltersOpen((current) => !current)}
        onFilterChange={marketplace.handleFilterChange}
        onReset={marketplace.handleResetFilters}
        onSearch={marketplace.handleSearch}
      />

      <StatusMessage tone="error" message={marketplace.errorMessage} />
      <StatusMessage tone="success" message={marketplace.successMessage} />

      <AnimalListingForm
        form={marketplace.form}
        editingId={marketplace.editingId}
        isSubmitting={marketplace.isSubmitting}
        photoFile={marketplace.photoFile}
        galleryFiles={marketplace.galleryFiles}
        existingPreviewUrls={marketplace.existingPreviewUrls}
        onCancelEdit={marketplace.resetForm}
        onFormChange={marketplace.handleFormChange}
        onGalleryFilesChange={marketplace.setGalleryFiles}
        onPhotoFileChange={marketplace.setPhotoFile}
        onSubmit={marketplace.handleSubmit}
      />

      <MarketplaceGrid
        isLoading={marketplace.isLoading}
        items={marketplace.animals}
        loadingText="Chargement des annonces animaliers..."
        emptyText="Aucune annonce animal ne correspond aux filtres actuels."
        renderItem={(animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            onDelete={marketplace.handleDelete}
            onEdit={marketplace.handleEdit}
          />
        )}
      />
    </section>
  )
}

function StatusMessage({ tone, message }) {
  if (!message) return null

  const classes = tone === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return <div className={`rounded-[28px] border px-5 py-4 text-sm ${classes}`}>{message}</div>
}

function MarketplaceGrid({ isLoading, items, loadingText, emptyText, renderItem }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2" aria-label={loadingText}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`animal-marketplace-skeleton-${index}`}
            className="animate-pulse rounded-[28px] border border-violet-100 bg-white/84 p-4 shadow-[0_18px_38px_rgba(124,58,237,0.06)]"
          >
            <div className="aspect-[4/3] rounded-[22px] bg-violet-100/80" />
            <div className="mt-4 h-4 w-2/3 rounded-full bg-violet-100" />
            <div className="mt-3 h-3 w-full rounded-full bg-violet-50" />
            <div className="mt-2 h-3 w-4/5 rounded-full bg-violet-50" />
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 rounded-full bg-violet-100" />
              <div className="h-8 w-20 rounded-full bg-violet-50" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
        {emptyText}
      </div>
    )
  }

  return <div className="grid gap-4 lg:grid-cols-2">{items.map(renderItem)}</div>
}

export default AnimalsMarketplacePage
