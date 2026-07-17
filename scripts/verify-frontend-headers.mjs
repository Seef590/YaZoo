import { readFile } from 'node:fs/promises'

const requiredHeaders = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-frame-options': null,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': null,
  'content-security-policy': null,
}

const target = process.argv[2] ?? 'infra/nginx/frontend.conf'

if (/^https?:\/\//i.test(target)) {
  const response = await fetch(target, { method: 'GET', redirect: 'manual' })
  assertHeaders(Object.fromEntries(response.headers.entries()))
} else {
  const contents = await readFile(target, 'utf8')
  const headers = {}

  for (const match of contents.matchAll(/add_header\s+([A-Za-z-]+)\s+"([^"]+)"/g)) {
    headers[match[1].toLowerCase()] = match[2]
  }

  assertHeaders(headers)
}

function assertHeaders(headers) {
  const missing = []

  for (const [name, expectedValue] of Object.entries(requiredHeaders)) {
    const actual = headers[name]

    if (!actual) {
      missing.push(name)
      continue
    }

    if (expectedValue !== null && actual !== expectedValue) {
      missing.push(`${name} expected "${expectedValue}" got "${actual}"`)
    }
  }

  if (headers['strict-transport-security']?.includes('preload')) {
    missing.push('strict-transport-security must not include preload before subdomains are fully controlled')
  }

  if (missing.length > 0) {
    console.error(`Header verification failed: ${missing.join('; ')}`)
    process.exit(1)
  }

  console.log('Frontend security headers verified.')
}
