import { useState } from 'react'
import { Link } from 'react-router-dom'

import Footer from '../components/ui/Footer'

function FeedbackPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitted(true)
    setForm({
      name: '',
      email: '',
      message: '',
    })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.42),_transparent_24%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[30px] border border-white/80 bg-white/94 p-5 shadow-[0_28px_70px_rgba(124,58,237,0.1)] sm:rounded-[34px] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-700">Feedback</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-950">
                Votre avis compte pour YaZoo
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                Dites-nous ce qui fonctionne bien et ce que vous souhaitez ameliorer.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-900 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              Retour
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              label="Nom"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Votre nom"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="vous@exemple.com"
            />

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Message</span>
              <textarea
                value={form.message}
                onChange={handleChange('message')}
                rows={6}
                placeholder="Votre message"
                className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
                required
              />
            </label>

            {isSubmitted ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Merci, votre feedback a ete envoye.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Envoyer le feedback
            </button>
          </form>
        </section>

        <Footer mode="public" className="mt-8" />
      </div>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <input
        className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
        required
        {...props}
      />
    </label>
  )
}

export default FeedbackPage
