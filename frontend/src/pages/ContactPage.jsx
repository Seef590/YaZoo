import { Link } from 'react-router-dom'

import Footer from '../components/ui/Footer'

const companyContact = {
  phone: '0606610014',
  email: 'bough.youssef@gmail.com',
}

function ContactPage() {
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
        </section>

        <Footer mode="public" className="mt-8" />
      </div>
    </main>
  )
}

export default ContactPage
