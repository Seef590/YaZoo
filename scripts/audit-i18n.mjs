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
const ignoredSuspiciousPatterns = [
  /^[A-Z0-9_]+$/,
  /^[a-z0-9_.:/?&=-]+$/i,
  /^#[0-9a-f]{3,8}$/i,
  /^(GET|POST|PATCH|PUT|DELETE)$/i,
  /^(button|submit|search|email|text|tel|password|number|file|checkbox|radio)$/i,
  /^(primary|secondary|ghost|soft|light|dark|success|error|warning)$/i,
  /^https?:\/\//i,
  /^\//,
  /^[\w-]+(\s+[\w-/:.[\]()%#]+)+$/,
  /\b(?:bg|text|border|shadow|rounded|ring|focus|hover|dark|print|max|pt|px|py|mt|gap|grid|flex|items|justify|transition)-/,
  /(?:linear-gradient|radial-gradient|rgba\(|encodeURIComponent|charAt|toUpperCase|Date\.now)/,
]
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

function isHumanText(text) {
  const normalized = text.trim()

  if (!normalized || normalized.length < 3 || ignoredText.has(normalized)) {
    return false
  }

  if (!/[\p{L}]/u.test(normalized)) {
    return false
  }

  return !ignoredSuspiciousPatterns.some((pattern) => pattern.test(normalized))
}

function pushSuspicious(collection, file, text) {
  const normalized = text.trim().replace(/\s+/g, ' ')

  if (isHumanText(normalized)) {
    collection.push({ file, text: normalized })
  }
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
  const isI18nFile = path.normalize(file) === path.normalize(i18nFile)

  for (const match of source.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)) {
    usedKeys.add(match[1])
  }

  for (const match of source.matchAll(/\bt\(\s*`([^`]+)`/g)) {
    dynamicKeys.push({ file: relative, key: match[1] })
  }

  for (const match of source.matchAll(/>([^<>{}\n]*[\p{L}][^<>{}\n]*)</gu)) {
    pushSuspicious(suspiciousTexts, relative, match[1])
  }

  for (const match of source.matchAll(/\b(?:label|placeholder|aria-label|alt|title)=["']([^"']*[\p{L}][^"']*)["']/gu)) {
    pushSuspicious(suspiciousTexts, relative, match[1])
  }

  if (isI18nFile) {
    continue
  }

  for (const match of source.matchAll(/\b(?:label|title|text|fallback|message|description|eyebrow|loading|empty|error|noReason|value)\s*:\s*['"`]([^'"`{}]*[\p{L}][^'"`{}]*)['"`]/gu)) {
    pushSuspicious(suspiciousTexts, relative, match[1])
  }

  for (const match of source.matchAll(/(?:\?\?|return|\?)\s*['"`]([^'"`{}]*[\p{L}][^'"`{}]*)['"`]/gu)) {
    pushSuspicious(suspiciousTexts, relative, match[1])
  }

  for (const match of source.matchAll(/\b(?:confirm|alert)\(\s*['"`]([^'"`{}]*[\p{L}][^'"`{}]*)['"`]/gu)) {
    pushSuspicious(suspiciousTexts, relative, match[1])
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
