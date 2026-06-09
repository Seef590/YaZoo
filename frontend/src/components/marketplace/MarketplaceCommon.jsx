import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

export function MarketplaceTabs({ active }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/80 bg-white/82 p-1.5 shadow-[0_14px_30px_rgba(124,58,237,0.08)]">
      <TabLink to="/marketplace" active={active === 'animals'}>Animaux</TabLink>
      <TabLink to="/marketplace/products" active={active === 'products'}>Produits</TabLink>
    </div>
  )
}

function TabLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.16)]'
          : 'text-stone-600 hover:bg-violet-50 hover:text-violet-900'
      }`}
    >
      {children}
    </Link>
  )
}

export function MarketplaceHero({ active, title, description, imageSrc, imageAlt, stats, imageClass = '' }) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.5),_transparent_26%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
        <div>
          <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
            Marketplace
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            {description}
          </p>
          <div className="mt-5">
            <MarketplaceTabs active={active} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-[1fr_auto] xl:items-center">
          {stats.map((stat) => (
            <HeroStatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
          <div className="overflow-hidden rounded-[26px] border border-violet-100 bg-white/82 p-4 shadow-sm sm:col-span-3 xl:col-span-1">
            <img src={imageSrc} alt={imageAlt} loading="lazy" decoding="async" className={imageClass} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function HeroStatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-white/88 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export function LinkButton({ children, to, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white hover:brightness-105 focus-visible:outline-violet-500',
    secondary: 'bg-white text-violet-900 ring-1 ring-inset ring-violet-200 hover:bg-violet-50 focus-visible:outline-violet-300',
    ghost: 'bg-violet-50 text-violet-800 hover:bg-violet-100 focus-visible:outline-violet-200',
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <input
        className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
        {...props}
      />
    </label>
  )
}

export function FileField({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <input
        type="file"
        className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[linear-gradient(135deg,#7c3aed,#a855f7)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        {...props}
      />
    </label>
  )
}

export function SelectField({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <select
        className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

export function Info({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-3 text-sm text-stone-600">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

MarketplaceTabs.propTypes = {
  active: PropTypes.string,
}

TabLink.propTypes = {
  to: PropTypes.string,
  active: PropTypes.bool,
  children: PropTypes.node,
}

MarketplaceHero.propTypes = {
  active: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  stats: PropTypes.array,
  imageClass: PropTypes.string,
}

HeroStatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

LinkButton.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  variant: PropTypes.string,
  className: PropTypes.string,
}

Field.propTypes = {
  label: PropTypes.string,
}

FileField.propTypes = {
  label: PropTypes.string,
}

SelectField.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array,
}

Info.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}
