import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

function SettingsPage() {
  const { logout, user } = useAuth()
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.9))] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] dark:border-violet-300/12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.28),_transparent_30%),linear-gradient(135deg,_rgba(24,16,38,0.96),_rgba(36,20,61,0.9))] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name ?? 'Utilisateur'} src={user?.avatar || ''} className="h-16 w-16" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-700 dark:text-violet-200">
                Parametres
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-stone-950 dark:text-violet-50">
                Gerer mon experience YaZoo
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-violet-100/68">
                Profil, langue, theme, securite et preferences de navigation.
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-50 dark:border-violet-300/16 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12"
          >
            Modifier mon profil
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard title="Langue" description="Choisissez la langue d'affichage du site.">
          <LanguageSwitcher />
        </SettingsCard>

        <SettingsCard
          title="Mode d'affichage"
          description={`Mode actuel : ${resolvedTheme === 'dark' ? 'nuit' : 'jour'}. Le mode auto suit le navigateur.`}
        >
          <div className="flex flex-wrap gap-2">
            {[
              ['system', 'Auto navigateur'],
              ['light', 'Mode clair'],
              ['dark', 'Mode nuit'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  theme === value
                    ? 'bg-violet-600 text-white shadow-[0_14px_28px_rgba(124,58,237,0.18)]'
                    : 'border border-violet-100 bg-white/78 text-violet-900 hover:bg-violet-50 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Compte" description="Acces rapide aux informations publiques et a la session.">
          <div className="grid gap-3 text-sm text-stone-600 dark:text-violet-100/70">
            <p>Nom : <span className="font-semibold text-stone-950 dark:text-violet-50">{user?.name ?? 'Utilisateur'}</span></p>
            <p>Email : <span className="font-semibold text-stone-950 dark:text-violet-50">{user?.email ?? 'Non renseigne'}</span></p>
            <p>Ville : <span className="font-semibold text-stone-950 dark:text-violet-50">{user?.city ?? 'Non renseignee'}</span></p>
          </div>
        </SettingsCard>

        <SettingsCard title="Securite" description="Controlez votre session active.">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={logout}>
              Se deconnecter
            </Button>
            <Link
              to="/contact"
              className="rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-50 dark:border-violet-300/16 dark:bg-white/8 dark:text-violet-50"
            >
              Contacter le support
            </Link>
          </div>
        </SettingsCard>
      </div>
    </section>
  )
}

function SettingsCard({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
      <h2 className="text-lg font-semibold text-stone-950 dark:text-violet-50">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-violet-100/66">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

SettingsCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
}

export default SettingsPage
