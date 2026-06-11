import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/client'
import Footer from '../components/ui/Footer'
import { useAuth } from '../hooks/useAuth'

const companyContact = {
  phone: '+212606610014',
  whatsapp: '212606610014',
  email: 'bough.youssef@gmail.com',
}

function ContactPage() {
  const { user } = useAuth()
  const [objet, setObjet] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [contactError, setContactError] = useState('')
  const [senderEmail, setSenderEmail] = useState(user?.email ?? '')

  useEffect(() => {
    if (user?.email) {
      setSenderEmail(user.email)
    }
  }, [user?.email])

  const handleSend = async (event) => {
    event.preventDefault()

    if (!message.trim() || !senderEmail.trim()) {
      return
    }

    setSending(true)
    setSent(false)
    setContactError('')

    try {
      await api.post('/contact', {
        email: senderEmail,
        objet: objet || 'Message depuis YaZoo',
        message,
      })
      setSent(true)
      setMessage('')
      setObjet('')
    } catch {
      setContactError("Impossible d'envoyer le message pour le moment.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.42),_transparent_24%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[30px] border border-white/80 bg-white/94 p-5 shadow-[0_28px_70px_rgba(124,58,237,0.1)] sm:rounded-[34px] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-700">Contact</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-950">
                Parlons de votre projet YaZoo
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                Contactez-nous directement pour toute question technique ou commerciale.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-900 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              Retour
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:${companyContact.phone}`}
              className="rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.84))] px-5 py-5 transition hover:-translate-y-0.5 hover:border-violet-200"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Numero</p>
              <p className="mt-3 text-xl font-semibold text-stone-950">{companyContact.phone}</p>
            </a>

            <a
              href={`mailto:${companyContact.email}`}
              className="rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.84))] px-5 py-5 transition hover:-translate-y-0.5 hover:border-violet-200"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Email</p>
              <p className="mt-3 text-xl font-semibold text-stone-950">{companyContact.email}</p>
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${companyContact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-100"
            >
              Ouvrir WhatsApp
            </a>
            <a
              href={`tel:${companyContact.phone}`}
              className="inline-flex items-center justify-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-violet-900 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              Appeler {companyContact.phone}
            </a>
          </div>

          <section className="mt-5 rounded-[26px] border border-violet-100 bg-violet-50/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Message direct
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Expliquez votre besoin, posez une question ou demandez une
              demonstration de YaZoo. Nous vous repondrons par email.
            </p>

            <form onSubmit={handleSend} className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Votre email
                </span>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(event) => setSenderEmail(event.target.value)}
                  readOnly={Boolean(user?.email)}
                  required
                  className={`w-full rounded-[22px] border px-4 py-3 text-sm outline-none transition ${
                    user?.email
                      ? 'border-stone-200 bg-white/70 text-stone-500'
                      : 'border-violet-100 bg-white/90 text-stone-700 focus:border-violet-300'
                  }`}
                  placeholder="votre@email.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Objet
                </span>
                <input
                  value={objet}
                  onChange={(event) => setObjet(event.target.value)}
                  className="w-full rounded-[22px] border border-violet-100 bg-white/90 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                  placeholder="Objet de votre message"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Message
                </span>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  className="w-full rounded-[22px] border border-violet-100 bg-white/90 px-4 py-3 text-sm leading-6 text-stone-700 outline-none transition focus:border-violet-300"
                  placeholder="Decrivez votre question ou besoin..."
                />
              </label>

              {sent ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Message envoye avec succes.
                </p>
              ) : null}

              {contactError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {contactError}
                </p>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || !message.trim() || !senderEmail.trim()}
                  className="inline-flex rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.2)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </div>
            </form>
          </section>
        </section>

        <Footer mode="public" className="mt-8" />
      </div>
    </main>
  )
}

export default ContactPage
