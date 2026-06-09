import { useState } from 'react'

function PasswordField({ label, onChange, ...props }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          className="w-full rounded-2xl border border-violet-100 bg-violet-50/55 px-4 py-3 pr-12 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
          onChange={(event) => onChange(event.target.value)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-violet-700 transition hover:bg-violet-100"
          aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          title={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.375a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="m3 3 18 18M9.88 9.88a3 3 0 1 0 4.24 4.24"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.73 5.2A10.84 10.84 0 0 1 12 5.13c6.38 0 9.75 6.75 9.75 6.75a17.59 17.59 0 0 1-2.52 3.56M6.6 6.6A18.2 18.2 0 0 0 2.25 12s3.38 6.75 9.75 6.75a10.9 10.9 0 0 0 5.37-1.44"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default PasswordField
