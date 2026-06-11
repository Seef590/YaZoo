import { Link } from 'react-router-dom'

function Footer({ className = '' }) {
  return (
    <footer
      className={`rounded-[28px] border border-white/80 bg-white/92 px-4 py-4 shadow-[0_18px_40px_rgba(124,58,237,0.08)] backdrop-blur dark:border-violet-300/14 dark:bg-white/8 dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)] ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
        <Link
          to="/contact"
          className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(124,58,237,0.16)] transition hover:brightness-105 sm:w-auto"
        >
          Contactez-nous
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs leading-6 text-stone-500 dark:text-violet-100/70">
          <img
            src="/yazoo-logo.svg"
            alt=""
            className="h-6 w-6 object-contain"
            aria-hidden="true"
          />
          <p>
            <span className="yz-wordmark text-xs font-semibold">YaZoo</span>
            {' '}(c) 2026 - Votre plateforme sociale et marketplace animalier.
            Une experience claire pour publier, echanger, vendre et gerer votre
            activite animale en ligne.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
