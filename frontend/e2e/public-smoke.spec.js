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

  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource:')
    ) {
      consoleErrors.push(message.text())
    }
  })
  page.on('response', (response) => {
    if (response.status() < 400) {
      return
    }

    const responsePath = new URL(response.url()).pathname
    const isExpectedGuestAuthProbe =
      response.status() === 401 && responsePath === '/api/auth/me'

    if (!isExpectedGuestAuthProbe) {
      unexpectedHttpErrors.push(`${response.status()} ${response.url()}`)
    }
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

  expect(hasGlobalHorizontalOverflow).toBe(false)
  expect(consoleErrors).toEqual([])
  expect(unexpectedHttpErrors).toEqual([])
  expect(failedRequests).toEqual([])
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
