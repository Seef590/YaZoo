import CollapsiblePanel from '../ui/CollapsiblePanel'
import Button from '../ui/Button'
import { Field, SelectField } from './MarketplaceCommon'
import { animalCategoryOptions, animalStatusOptions } from '../../features/marketplace/marketplaceOptions'
import { formatFiltersSummary } from '../../features/marketplace/marketplaceUtils'
import { useI18n } from '../../hooks/useI18n'

function AnimalsFilters({ filters, activeFiltersCount, isOpen, onToggle, onFilterChange, onReset, onSearch }) {
  const { t } = useI18n()

  return (
    <CollapsiblePanel
      kicker={t('animals.filtersKicker')}
      title={t('animals.filtersTitle')}
      description={t('animals.filtersDescription')}
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label={t('common.search')} value={filters.q} onChange={onFilterChange('q')} placeholder={t('animals.searchPlaceholder')} />
          <SelectField label={t('common.category')} value={filters.category} onChange={onFilterChange('category')} options={animalCategoryOptions} />
          <Field label={t('common.type')} value={filters.type} onChange={onFilterChange('type')} />
          <SelectField
            label={t('common.sex')}
            value={filters.sex}
            onChange={onFilterChange('sex')}
            options={[
              { value: '', labelKey: 'animals.labels.all' },
              { value: 'male', labelKey: 'animals.labels.male' },
              { value: 'female', labelKey: 'animals.labels.female' },
              { value: 'unknown', labelKey: 'animals.labels.unknown' },
            ]}
          />
          <Field label={t('feed.location')} value={filters.location} onChange={onFilterChange('location')} />
          <SelectField label={t('common.status')} value={filters.listing_status} onChange={onFilterChange('listing_status')} options={animalStatusOptions} />
          <SelectField
            label={t('common.mode')}
            value={filters.adoption}
            onChange={onFilterChange('adoption')}
            options={[
              { value: '', labelKey: 'animals.labels.all' },
              { value: 'true', labelKey: 'animals.adoption' },
              { value: 'false', labelKey: 'animals.sale' },
            ]}
          />
          <Field label={`${t('common.price')} min`} type="number" min="0" value={filters.min_price} onChange={onFilterChange('min_price')} />
          <Field label={`${t('common.price')} max`} type="number" min="0" value={filters.max_price} onChange={onFilterChange('max_price')} />
        </div>

        <div className="mt-4 flex justify-stretch sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">{t('common.applyFilters')}</Button>
        </div>
      </form>
    </CollapsiblePanel>
  )
}

export default AnimalsFilters
