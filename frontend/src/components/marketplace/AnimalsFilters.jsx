import CollapsiblePanel from '../ui/CollapsiblePanel'
import Button from '../ui/Button'
import { Field, SelectField } from './MarketplaceCommon'
import { animalCategoryOptions, animalStatusOptions } from '../../features/marketplace/marketplaceOptions'
import { formatFiltersSummary } from '../../features/marketplace/marketplaceUtils'

function AnimalsFilters({ filters, activeFiltersCount, isOpen, onToggle, onFilterChange, onReset, onSearch }) {
  return (
    <CollapsiblePanel
      kicker="Marketplace animaux"
      title="Rechercher des animaux"
      description="Filtrez par categorie, statut, type, ville, prix ou adoption."
      summary={formatFiltersSummary(activeFiltersCount)}
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        activeFiltersCount > 0 ? (
          <Button type="button" variant="ghost" onClick={onReset}>Reinitialiser</Button>
        ) : null
      }
    >
      <form onSubmit={onSearch}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Recherche" value={filters.q} onChange={onFilterChange('q')} placeholder="Nom, race, description..." />
          <SelectField label="Categorie" value={filters.category} onChange={onFilterChange('category')} options={animalCategoryOptions} />
          <Field label="Type" value={filters.type} onChange={onFilterChange('type')} />
          <SelectField
            label="Sexe"
            value={filters.sex}
            onChange={onFilterChange('sex')}
            options={[
              { value: '', label: 'Tous' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Femelle' },
              { value: 'unknown', label: 'Inconnu' },
            ]}
          />
          <Field label="Localisation" value={filters.location} onChange={onFilterChange('location')} />
          <SelectField label="Statut" value={filters.listing_status} onChange={onFilterChange('listing_status')} options={animalStatusOptions} />
          <SelectField
            label="Mode"
            value={filters.adoption}
            onChange={onFilterChange('adoption')}
            options={[
              { value: '', label: 'Tous' },
              { value: 'true', label: 'Adoption' },
              { value: 'false', label: 'Vente' },
            ]}
          />
          <Field label="Prix min" type="number" min="0" value={filters.min_price} onChange={onFilterChange('min_price')} />
          <Field label="Prix max" type="number" min="0" value={filters.max_price} onChange={onFilterChange('max_price')} />
        </div>

        <div className="mt-4 flex justify-stretch sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">Appliquer les filtres</Button>
        </div>
      </form>
    </CollapsiblePanel>
  )
}

export default AnimalsFilters
