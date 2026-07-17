import { messages, SUPPORTED_LOCALES } from '../frontend/src/lib/i18n.js'

const requiredLocales = ['fr', 'ar', 'en']
const allowedInternationalWords = new Set([
  'YaZoo',
  'WhatsApp',
  'Email',
  'MAD',
  'JSON',
  'CSV',
  'PDF',
  'CMI',
  'CNDP',
  'ONSSA',
  'OTP',
  'RTL',
  'SMS',
  'Payzone',
  'Stripe',
  'FR',
  'AR',
  'EN',
])

const allowedExactValues = new Set([
  '',
  'YaZoo',
  'WhatsApp',
  'Email',
  'MAD',
  'English',
  'Espanol',
  'Nederlands',
  'Portugues',
  'Italiano',
  'Русский',
  'SMS OTP',
  'payzone',
  'stripe',
  'Payzone',
  'PayZone',
  'Stripe',
])

const technicalValuePatterns = [
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /^\*+$/,
  /^[0-9\s.,:%/+()-]+$/,
  /^https?:\/\//i,
  /^\//,
  /^[A-Z0-9_.-]+$/,
  /^\{[a-zA-Z0-9_]+\}$/,
  /^[\p{Script=Arabic}\s،؛؟!0-9{}.,:%/+()-]+$/u,
]

if (JSON.stringify(SUPPORTED_LOCALES) !== JSON.stringify(requiredLocales)) {
  fail([`SUPPORTED_LOCALES must stay ${requiredLocales.join(', ')}`])
}

const flattened = Object.fromEntries(
  requiredLocales.map((locale) => [locale, flatten(messages[locale] ?? {})]),
)
const failures = []
const frKeys = new Set(Object.keys(flattened.fr))

for (const locale of ['ar', 'en']) {
  const localeKeys = new Set(Object.keys(flattened[locale]))

  for (const key of frKeys) {
    if (!localeKeys.has(key)) {
      failures.push(`${locale}: missing key ${key}`)
    }
  }

  for (const key of localeKeys) {
    if (!frKeys.has(key)) {
      failures.push(`${locale}: extra key ${key}`)
    }
  }
}

for (const [key, arValue] of Object.entries(flattened.ar)) {
  if (typeof arValue !== 'string' || isAllowedValue(arValue)) {
    continue
  }

  const frValue = flattened.fr[key]
  const enValue = flattened.en[key]

  if (arValue === frValue || arValue === enValue) {
    failures.push(`ar: suspicious fallback at ${key}`)
    continue
  }

  if (hasHumanLetters(arValue) && !hasArabicLetters(arValue) && !isMostlyAllowedInternational(arValue)) {
    failures.push(`ar: value has no Arabic script at ${key}`)
  }
}

if (failures.length > 0) {
  fail(failures)
}

console.log(`i18n completeness verified for ${requiredLocales.join('/')}: ${frKeys.size} keys.`)

function flatten(value, prefix = '') {
  const output = {}

  if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((key) => /^\d+$/.test(key))) {
    output[prefix] = Object.values(value).join(' ')
    return output
  }

  for (const [key, child] of Object.entries(value)) {
    if (/^\d+$/.test(key)) {
      continue
    }

    const nextKey = prefix ? `${prefix}.${key}` : key

    if (Array.isArray(child)) {
      output[nextKey] = child.join(' ')
      continue
    }

    if (typeof child === 'string') {
      output[nextKey] = child
      continue
    }

    if (child && typeof child === 'object' && !Array.isArray(child)) {
      Object.assign(output, flatten(child, nextKey))
      continue
    }

    output[nextKey] = String(child ?? '')
  }

  return output
}

function hasArabicLetters(value) {
  return /\p{Script=Arabic}/u.test(value)
}

function hasHumanLetters(value) {
  return /\p{L}/u.test(value)
}

function isAllowedValue(value) {
  const normalized = value.trim()

  return allowedExactValues.has(normalized)
    || technicalValuePatterns.some((pattern) => pattern.test(normalized))
}

function isMostlyAllowedInternational(value) {
  const words = value.match(/[\p{L}0-9]+/gu) ?? []

  return words.length > 0 && words.every((word) => allowedInternationalWords.has(word))
}

function fail(items) {
  console.error('i18n completeness audit failed:')
  for (const item of items.slice(0, 200)) {
    console.error(`- ${item}`)
  }
  if (items.length > 200) {
    console.error(`- ... ${items.length - 200} more`)
  }
  process.exit(1)
}
