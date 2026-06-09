import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import Button from '../components/ui/Button'
import Footer from '../components/ui/Footer'
import PasswordField from '../components/ui/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'

const highlights = [
  'Retrouvez vos stories, votre feed et vos echanges sans friction.',
  'Reprenez vos annonces, vos reservations et votre activite en quelques secondes.',
  'Profitez d une interface plus calme, plus nette et plus memorisable.',
]

function LoginPage() {
  const { isAuthenticated, isBootstrapping, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffaff_0%,_#f6efff_100%)] px-4 py-10">
        <p className="text-sm text-stone-600">
          Verification de la session...
        </p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de se connecter pour le moment.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.42),_transparent_24%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid min-h-[calc(100vh-3rem)] w-full gap-5 sm:min-h-[calc(100vh-4rem)] sm:gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,_rgba(124,58,237,0.92),_rgba(168,85,247,0.88),_rgba(237,233,254,0.84))] p-5 text-white shadow-[0_28px_70px_rgba(124,58,237,0.18)] sm:rounded-[34px] sm:p-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/30 bg-white/16 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/24"
          >
            Retour a l'accueil
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.24em] text-violet-50">
            YaZoo
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Revenez dans un espace qui donne envie de partager, vendre et rester present.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-violet-50/92">
            Connectez-vous pour retrouver votre univers YaZoo, vos contacts, vos
            stories et votre marketplace dans une ambiance plus premium et plus
            rassurante.
          </p>

          <div className="mt-8 space-y-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/24 bg-white/14 px-4 py-4 text-sm leading-6 text-white/92 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/94 p-5 shadow-[0_28px_70px_rgba(124,58,237,0.1)] sm:rounded-[34px] sm:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-violet-700">
            Connexion
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950 sm:text-3xl">
            Heureux de vous retrouver
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Ouvrez votre compte YaZoo pour reprendre vos publications, vos
            annonces et vos conversations la ou elles vous attendent.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
            <PasswordField
              label="Mot de passe"
              value={password}
              onChange={setPassword}
              placeholder="********"
              autoComplete="current-password"
            />

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-stone-500">
            Pas encore de compte ?{' '}
            <Link className="font-medium text-violet-900" to="/register">
              Creer un compte
            </Link>
          </p>
        </section>
        </div>

        <Footer mode="public" className="mt-8" />
      </div>
    </main>
  )
}

function Field({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <input
        className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

export default LoginPage
