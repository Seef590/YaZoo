import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { getServicesRequest } from '../api/services'
import ServiceCard from '../components/marketplace/ServiceCard'
import { MarketplaceHero } from '../components/marketplace/MarketplaceCommon'
import CollapsiblePanel from '../components/ui/CollapsiblePanel'
import trainerHeroImage from '../assets/images/dresseur.png'
import { useI18n } from '../hooks/useI18n'

function ServicesMarketplacePage() {
  const { t } = useI18n()
  const [services, setServices] = useState([])
  const [type, setType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [error, setError] = useState('')
  const activeFiltersCount = type ? 1 : 0

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      setIsLoading(true)
      setError('')

      try {
        const response = await getServicesRequest(type ? { type } : {})
        if (isMounted) {
          setServices(response.data.data ?? [])
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

    loadServices()

    return () => {
      isMounted = false
    }
  }, [type, t])

  return (
    <section className="space-y-6">
      <MarketplaceHero
        active="services"
        title={t('services.marketplaceTitle')}
        description={t('services.marketplaceDescription')}
        imageSrc={trainerHeroImage}
        imageAlt={t('services.marketplaceTitle')}
        imageClass="mx-auto h-24 w-auto rounded-[20px] object-cover sm:h-28 xl:w-[180px]"
        stats={[
          { label: t('services.visibleServices'), value: services.length },
          { label: t('services.assistance'), value: t('services.petSitting') },
        ]}
      />

      <CollapsiblePanel
        kicker={t('services.assistance')}
        title={t('services.filtersTitle')}
        description={t('services.filtersDescription')}
        summary={activeFiltersCount > 0 ? t('services.activeFilters', { count: activeFiltersCount }) : t('services.noActiveFilters')}
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen((current) => !current)}
      >
        <div className="flex flex-wrap gap-2">
          <FilterButton active={!type} onClick={() => setType('')}>{t('common.all')}</FilterButton>
          <FilterButton active={type === 'pet_sitting'} onClick={() => setType('pet_sitting')}>{t('services.petSitting')}</FilterButton>
          <FilterButton active={type === 'training'} onClick={() => setType('training')}>{t('services.training')}</FilterButton>
        </div>
      </CollapsiblePanel>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[28px] border border-violet-100 bg-white/84 px-5 py-12 text-center text-sm text-stone-500 dark:border-violet-300/16 dark:bg-white/10 dark:text-violet-100">
          {t('common.loading')}
        </div>
      ) : null}

      {!isLoading && services.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500 dark:border-violet-300/20 dark:bg-white/10 dark:text-violet-100">
          {t('services.empty')}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7)] text-white'
          : 'border border-violet-100 bg-white/80 text-violet-900 hover:bg-violet-50 dark:border-violet-300/18 dark:bg-white/8 dark:text-violet-50'
      }`}
    >
      {children}
    </button>
  )
}

FilterButton.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
}

export default ServicesMarketplacePage
