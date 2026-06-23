import { useEffect, useMemo, useState } from 'react'

import { listVeterinariansRequest } from '../api/veterinarians'
import VeterinarianCard from '../components/marketplace/VeterinarianCard'
import { Field, MarketplaceHero } from '../components/marketplace/MarketplaceCommon'
import CollapsiblePanel from '../components/ui/CollapsiblePanel'
import companionImage from '../assets/images/pretty-girl-embarcing-cat-dog.webp'
import { useI18n } from '../hooks/useI18n'

function VeterinariansMarketplacePage() {
  const { t } = useI18n()
  const [veterinarians, setVeterinarians] = useState([])
  const [filters, setFilters] = useState({ search: '', city: '', specialty: '' })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [error, setError] = useState('')

  const activeFiltersCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters],
  )

  useEffect(() => {
    let isMounted = true

    async function loadVeterinarians() {
      setIsLoading(true)
      setError('')

      try {
        const response = await listVeterinariansRequest(cleanFilters(appliedFilters))
        if (isMounted) {
          setVeterinarians(response.data.data ?? [])
        }
      } catch {
        if (isMounted) {
          setError(t('errors.generic'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadVeterinarians()

    return () => {
      isMounted = false
    }
  }, [appliedFilters, t])

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    const nextFilters = { search: '', city: '', specialty: '' }
    setFilters(nextFilters)
    setAppliedFilters(nextFilters)
  }

  return (
    <section className="space-y-6">
      <MarketplaceHero
        active="veterinarians"
        title={t('veterinarians.title')}
        description={t('veterinarians.subtitle')}
        imageSrc={companionImage}
        imageAlt={t('veterinarians.title')}
        imageClass="mx-auto h-24 w-auto rounded-[20px] object-cover sm:h-28 xl:w-[180px]"
        stats={[
          { label: t('veterinarians.visibleVeterinarians'), value: veterinarians.length },
          { label: t('common.filtersActive'), value: activeFiltersCount },
        ]}
      />

      <CollapsiblePanel
        kicker={t('veterinarians.title')}
        title={t('veterinarians.filtersTitle')}
        description={t('veterinarians.filtersDescription')}
        summary={activeFiltersCount > 0 ? t('marketplace.filtersSummaryCount', { count: activeFiltersCount, plural: activeFiltersCount > 1 ? 's' : '' }) : t('marketplace.filtersSummaryEmpty')}
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen((current) => !current)}
      >
        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSearch}>
          <Field
            label={t('common.search')}
            value={filters.search}
            onChange={handleFilterChange('search')}
            placeholder={t('veterinarians.searchPlaceholder')}
          />
          <Field
            label={t('veterinarians.city')}
            value={filters.city}
            onChange={handleFilterChange('city')}
            placeholder={t('veterinarians.cityFilter')}
          />
          <Field
            label={t('veterinarians.specialties')}
            value={filters.specialty}
            onChange={handleFilterChange('specialty')}
            placeholder={t('veterinarians.specialtyPlaceholder')}
          />
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <button
              type="submit"
              className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-5 py-2 text-sm font-semibold text-white"
            >
              {t('common.applyFilters')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-violet-100 bg-white/80 px-5 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-50 dark:border-violet-300/18 dark:bg-white/8 dark:text-violet-50"
            >
              {t('common.reset')}
            </button>
          </div>
        </form>
      </CollapsiblePanel>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[28px] border border-violet-100 bg-white/84 px-5 py-12 text-center text-sm text-stone-500 dark:border-violet-300/16 dark:bg-white/10 dark:text-violet-100">
          {t('veterinarians.loading')}
        </div>
      ) : null}

      {!isLoading && veterinarians.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500 dark:border-violet-300/20 dark:bg-white/10 dark:text-violet-100">
          {t('veterinarians.empty')}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {veterinarians.map((veterinarian) => (
          <VeterinarianCard key={veterinarian.id} veterinarian={veterinarian} />
        ))}
      </div>
    </section>
  )
}

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => String(value ?? '').trim() !== ''),
  )
}

export default VeterinariansMarketplacePage
