import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies()
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
})

async function mockGuestApi(page) {
  await page.route('**/sanctum/csrf-cookie', async (route) => {
    await route.fulfill({ status: 204 })
  })

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthenticated.' }),
    })
  })

  await page.route('**/api/marketplace/public-preview**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          animals: [
            {
              id: 1,
              type: 'animal',
              title: 'Chat à adopter',
              subtitle: 'Chat · Européen',
              description: 'Annonce publique de démonstration.',
              location: 'Casablanca',
              price: null,
              imageUrl: null,
              badge: 'adoption',
              createdAt: '2026-07-24T10:00:00Z',
              author: { name: 'Association YaZoo', avatar: null },
            },
          ],
          products: [],
          services: [],
          veterinarians: [],
        },
      }),
    })
  })
}

test('landing page locale charge sans compte reel', async ({ page }) => {
  await mockGuestApi(page)

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Moroccan animal community/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /Latest YaZoo Marketplace listings/i })).toBeVisible()
  await expect(page.getByText('Chat à adopter')).toBeVisible()

  await page.getByRole('link', { name: 'View details' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('aperçu public reste responsive sans débordement et supporte sombre et RTL', async ({
  page,
}) => {
  await mockGuestApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    window.localStorage.setItem('yazoo-theme', 'dark')
    window.localStorage.setItem('yazoo-locale', 'ar')
  })

  const consoleErrors = []
  const unexpectedHttpErrors = []
  const failedRequests = []
  const expectedGuestAuth401Urls = new Set()

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push({
        text: message.text(),
        url: message.location().url,
      })
    }
  })
  page.on('response', (response) => {
    if (response.status() < 400) {
      return
    }

    const responsePath = getUrlPathname(response.url())
    const isExpectedGuestAuthProbe =
      response.status() === 401 && responsePath === '/api/auth/me'

    if (isExpectedGuestAuthProbe) {
      expectedGuestAuth401Urls.add(response.url())
      return
    }

    unexpectedHttpErrors.push(`${response.status()} ${response.url()}`)
  })
  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`.trim(),
    )
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /أحدث إعلانات سوق YaZoo/i })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveClass(/dark/)

  const hasGlobalHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  const unexpectedConsoleErrors = consoleErrors.filter(
    (consoleError) =>
      !isExpectedGuestAuthConsoleError(consoleError, expectedGuestAuth401Urls),
  )

  expect(hasGlobalHorizontalOverflow).toBe(false)
  expect(unexpectedConsoleErrors).toEqual([])
  expect(unexpectedHttpErrors).toEqual([])
  expect(failedRequests).toEqual([])
})

test('seul le message console du 401 exact de auth me est attendu', () => {
  const expectedUrls = new Set(['http://localhost:4173/api/auth/me'])

  expect(
    isExpectedGuestAuthConsoleError(
      {
        text: 'Failed to load resource: the server responded with a status of 401',
        url: 'http://localhost:4173/api/auth/me',
      },
      expectedUrls,
    ),
  ).toBe(true)
  expect(
    isExpectedGuestAuthConsoleError(
      {
        text: 'Failed to load resource: the server responded with a status of 403',
        url: 'http://localhost:4173/api/auth/me',
      },
      expectedUrls,
    ),
  ).toBe(false)
  expect(
    isExpectedGuestAuthConsoleError(
      {
        text: 'Failed to load resource: the server responded with a status of 401',
        url: 'http://localhost:4173/api/private',
      },
      expectedUrls,
    ),
  ).toBe(false)
  expect(
    isExpectedGuestAuthConsoleError(
      {
        text: 'Failed to load resource: the server responded with a status of 401',
        url: '',
      },
      expectedUrls,
    ),
  ).toBe(false)
})

test('page confiance et securite reste publique', async ({ page }) => {
  await mockGuestApi(page)

  await page.goto('/trust')

  await expect(page).toHaveURL(/\/trust$/)
  await expect(page.getByRole('heading', { name: /Clearer exchanges/i })).toBeVisible()
})

test('login affiche le formulaire sans secret reel', async ({ page }) => {
  await mockGuestApi(page)

  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByRole('textbox', { name: /Password/i })).toBeVisible()
})

test('marketplace protege redirige vers login si invite', async ({ page }) => {
  await mockGuestApi(page)

  await page.goto('/marketplace')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
})

function isExpectedGuestAuthConsoleError(consoleError, expectedUrls) {
  return (
    consoleError.text.startsWith('Failed to load resource:') &&
    /\b401\b/.test(consoleError.text) &&
    getUrlPathname(consoleError.url) === '/api/auth/me' &&
    expectedUrls.has(consoleError.url)
  )
}

function getUrlPathname(value) {
  try {
    return new URL(value).pathname
  } catch {
    return null
  }
}
