import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const frontendSrc = path.join(repoRoot, 'frontend', 'src')
const i18nFile = path.join(frontendSrc, 'lib', 'i18n.js')
const reportFile = path.join(repoRoot, 'AUDIT_I18N_UI_MOBILE_YAZOO.md')

const domains = [
  'common',
  'nav',
  'auth',
  'feed',
  'comments',
  'stories',
  'story',
  'marketplace',
  'animals',
  'products',
  'services',
  'communities',
  'messages',
  'reservations',
  'notifications',
  'profile',
  'admin',
  'contact',
  'validation',
  'errors',
  'statuses',
]

const ignoredText = new Set(['YaZoo', 'WhatsApp', 'Email', 'MAD'])
const ignoredFilePatterns = [
  /\.test\.[jt]sx?$/,
  /assets[\\/]/,
  /types[\\/]/,
]

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return walk(fullPath)
    }

    return /\.(jsx?|tsx?)$/.test(entry.name) ? [fullPath] : []
  })
}

function getByPath(object, key) {
  return key.split('.').reduce((current, segment) => current?.[segment], object)
}

function extractMessages() {
  const source = fs.readFileSync(i18nFile, 'utf8')
  const result = {}

  for (const locale of ['fr', 'ar', 'en']) {
    result[locale] = {}

    for (const key of usedKeys) {
      result[locale][key] = source.includes(`${key.split('.').at(-1)}:`)
    }
  }

  return result
}

const files = walk(frontendSrc).filter((file) =>
  !ignoredFilePatterns.some((pattern) => pattern.test(file)),
)

const usedKeys = new Set()
const dynamicKeys = []
const suspiciousTexts = []

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const relative = path.relative(repoRoot, file)

  for (const match of source.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)) {
    usedKeys.add(match[1])
  }

  for (const match of source.matchAll(/\bt\(\s*`([^`]+)`/g)) {
    dynamicKeys.push({ file: relative, key: match[1] })
  }

  for (const match of source.matchAll(/>([^<>{}\n]*[A-Za-zÀ-ÿ][^<>{}\n]*)</g)) {
    const text = match[1].trim()

    if (!text || ignoredText.has(text) || text.length < 3) {
      continue
    }

    suspiciousTexts.push({ file: relative, text })
  }

  for (const match of source.matchAll(/\b(?:placeholder|aria-label|alt|title)=["']([^"']*[A-Za-zÀ-ÿ][^"']*)["']/g)) {
    const text = match[1].trim()

    if (!text || ignoredText.has(text)) {
      continue
    }

    suspiciousTexts.push({ file: relative, text })
  }
}

const keyList = [...usedKeys].sort()
const i18nSource = fs.readFileSync(i18nFile, 'utf8')
const missingByDomain = domains
  .filter((domain) => !keyList.some((key) => key.startsWith(`${domain}.`)))
const suspiciousMissingKeys = keyList.filter((key) => {
  const leaf = key.split('.').at(-1)

  return !i18nSource.includes(`${leaf}:`)
})

const report = [
  '# AUDIT I18N UI MOBILE YAZOO',
  '',
  `Date: ${new Date().toISOString()}`,
  '',
  '## Fichiers audites',
  '',
  `- ${files.length} fichiers frontend dans frontend/src`,
  '- backend/app/Http, backend/lang et routes API audites manuellement pendant la correction',
  '',
  '## Domaines i18n verifies',
  '',
  ...domains.map((domain) => `- ${domain}`),
  '',
  '## Cles utilisees',
  '',
  `- ${keyList.length} cles t(...) detectees`,
  `- ${dynamicKeys.length} cles dynamiques detectees`,
  '',
  '## Domaines sans cle detectee',
  '',
  ...(missingByDomain.length ? missingByDomain.map((domain) => `- ${domain}`) : ['- Aucun']),
  '',
  '## Cles potentiellement manquantes',
  '',
  ...(suspiciousMissingKeys.length ? suspiciousMissingKeys.map((key) => `- ${key}`) : ['- Aucune par heuristique']),
  '',
  '## Textes statiques suspects',
  '',
  ...(suspiciousTexts.length
    ? suspiciousTexts.slice(0, 300).map((item) => `- ${item.file}: ${item.text}`)
    : ['- Aucun texte suspect detecte']),
  '',
  '## Corrections couvertes',
  '',
  '- Langues stabilisees sur fr/ar/en.',
  '- Accept-Language envoye par les clients Axios frontend.',
  '- Backend Laravel limite a fr/ar/en avec fallback fr.',
  '- Marketplace mobile: menu Animaux / Produits / Services conserve et rendu scrollable localement.',
  '- PostCard: image pleine largeur du parent avec padding controle, menu trois points et RTL ameliores.',
  '- Bottom navigation: padding bas avec safe-area pour eviter le recouvrement.',
  '',
].join('\n')

fs.writeFileSync(reportFile, report)

console.log(`Audit i18n termine: ${reportFile}`)
console.log(`Cles detectees: ${keyList.length}`)
console.log(`Textes statiques suspects: ${suspiciousTexts.length}`)

