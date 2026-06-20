import CollapsiblePanel from '../ui/CollapsiblePanel'
import Button from '../ui/Button'
import { Field, SelectField } from './MarketplaceCommon'
import { productCategoryOptions, productStatusOptions } from '../../features/marketplace/marketplaceOptions'
import { formatFiltersSummary } from '../../features/marketplace/marketplaceUtils'
import { useI18n } from '../../hooks/useI18n'

function ProductsFilters({ filters, activeFiltersCount, isOpen, onToggle, onFilterChange, onReset, onSearch }) {
  const { t } = useI18n()

  return (
    <CollapsiblePanel
      kicker={t('products.filtersKicker')}
      title={t('products.filtersTitle')}
      description={t('products.filtersDescription')}
      summary={formatFiltersSummary(activeFiltersCount, t)}
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        activeFiltersCount > 0 ? (
          <Button type="button" variant="ghost" onClick={onReset}>{t('common.reset')}</Button>
        ) : null
      }
    >
      <form onSubmit={onSearch}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label={t('common.search')} value={filters.q} onChange={onFilterChange('q')} placeholder={t('products.searchPlaceholder')} />
          <SelectField label={t('common.category')} value={filters.category} onChange={onFilterChange('category')} options={productCategoryOptions} />
          <Field label={`${t('common.price')} min`} type="number" value={filters.min_price} onChange={onFilterChange('min_price')} />
          <Field label={`${t('common.price')} max`} type="number" value={filters.max_price} onChange={onFilterChange('max_price')} />
          <Field label={t('feed.location')} value={filters.location} onChange={onFilterChange('location')} />
          <SelectField label={t('common.status')} value={filters.listing_status} onChange={onFilterChange('listing_status')} options={productStatusOptions} />
          <SelectField
            label={t('common.condition')}
            value={filters.condition_status}
            onChange={onFilterChange('condition_status')}
            options={[
              { value: '', labelKey: 'products.labels.all' },
              { value: 'new', labelKey: 'products.labels.new' },
              { value: 'used', labelKey: 'products.labels.used' },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-stretch sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">{t('common.applyFilters')}</Button>
        </div>
      </form>
    </CollapsiblePanel>
  )
}

export default ProductsFilters
