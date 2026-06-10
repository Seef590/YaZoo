import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getGoogleAuthUrl } from '../api/auth'
import Button from '../components/ui/Button'
import Footer from '../components/ui/Footer'
import PasswordField from '../components/ui/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'

const onboardingNotes = [
  'Creez une presence qui inspire confiance des votre premiere apparition.',
  'Publiez, vendez, reservez et discutez dans un seul univers coherent.',
  'Avancez avec une interface pensee pour etre simple, douce et engageante.',
]

function RegisterPage() {
  const { isAuthenticated, isBootstrapping, register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    country: '',
    city: '',
  })
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

  const handleChange = (field) => (value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await register(form)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de creer le compte pour le moment."),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = () => {
    globalThis.location.assign(getGoogleAuthUrl())
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.42),_transparent_24%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid min-h-[calc(100vh-3rem)] w-full gap-5 sm:min-h-[calc(100vh-4rem)] sm:gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <section className="order-2 rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,_rgba(124,58,237,0.94),_rgba(168,85,247,0.88),_rgba(237,233,254,0.82))] p-5 text-white shadow-[0_28px_70px_rgba(124,58,237,0.18)] sm:rounded-[34px] sm:p-6 lg:order-2">
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
            Creez votre place dans une plateforme qui rend le monde animalier plus vivant.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-violet-50/92">
            Ouvrez votre espace YaZoo pour partager votre univers, publier vos
            annonces et construire une reputation qui rassure.
          </p>

          <div className="mt-8 space-y-3">
            {onboardingNotes.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/24 bg-white/14 px-4 py-4 text-sm leading-6 text-white/92 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 rounded-[30px] border border-white/80 bg-white/94 p-5 shadow-[0_28px_70px_rgba(124,58,237,0.1)] sm:rounded-[34px] sm:p-6 lg:order-1">
          <p className="text-xs uppercase tracking-[0.24em] text-violet-700">
            Inscription
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950 sm:text-3xl">
            Ouvrir mon espace YaZoo
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Creez votre compte en quelques instants et accedez directement a un
            espace pret a accueillir vos publications, annonces et contacts.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              label="Nom"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Votre nom"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <PasswordField
                label="Mot de passe"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="********"
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirmation"
                value={form.password_confirmation}
                onChange={handleChange('password_confirmation')}
                placeholder="********"
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Telephone"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="+212..."
                autoComplete="tel"
              />
              <Field
                label="Pays"
                value={form.country}
                onChange={handleChange('country')}
                placeholder="Maroc"
                autoComplete="country-name"
              />
              <Field
                label="Ville"
                value={form.city}
                onChange={handleChange('city')}
                placeholder="Casablanca"
                autoComplete="address-level2"
              />
            </div>

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Creation...' : 'Creer mon compte'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-violet-100" />
            <span className="text-xs uppercase tracking-[0.16em] text-stone-400">
              ou
            </span>
            <div className="h-px flex-1 bg-violet-100" />
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-[0_14px_30px_rgba(124,58,237,0.08)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/80"
          >
            <GoogleMark />
            Continuer avec Google
          </button>

          <p className="mt-5 text-sm text-stone-500">
            Vous avez deja un compte ?{' '}
            <Link className="font-medium text-violet-900" to="/login">
              Se connecter
            </Link>
          </p>
        </section>
        </div>

        <Footer mode="public" className="mt-8" />
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-violet-700 shadow-sm">
      G
    </span>
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

export default RegisterPage
