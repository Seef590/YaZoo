import CollapsiblePanel from '../ui/CollapsiblePanel'
import Button from '../ui/Button'
import { Field, SelectField } from './MarketplaceCommon'
import { productCategoryOptions, productStatusOptions } from '../../features/marketplace/marketplaceOptions'
import { formatFiltersSummary } from '../../features/marketplace/marketplaceUtils'

function ProductsFilters({ filters, activeFiltersCount, isOpen, onToggle, onFilterChange, onReset, onSearch }) {
  return (
    <CollapsiblePanel
      kicker="Marketplace produits"
      title="Rechercher des produits"
      description="Filtrez les annonces par categorie, prix, etat, localisation et statut."
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Recherche" value={filters.q} onChange={onFilterChange('q')} placeholder="Nom ou description..." />
          <SelectField label="Categorie" value={filters.category} onChange={onFilterChange('category')} options={productCategoryOptions} />
          <Field label="Prix min" type="number" value={filters.min_price} onChange={onFilterChange('min_price')} />
          <Field label="Prix max" type="number" value={filters.max_price} onChange={onFilterChange('max_price')} />
          <Field label="Localisation" value={filters.location} onChange={onFilterChange('location')} />
          <SelectField label="Statut" value={filters.listing_status} onChange={onFilterChange('listing_status')} options={productStatusOptions} />
          <SelectField
            label="Etat du produit"
            value={filters.condition_status}
            onChange={onFilterChange('condition_status')}
            options={[
              { value: '', label: 'Tous' },
              { value: 'new', label: 'Neuf' },
              { value: 'used', label: 'Occasion' },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-stretch sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">Appliquer les filtres</Button>
        </div>
      </form>
    </CollapsiblePanel>
  )
}

export default ProductsFilters
