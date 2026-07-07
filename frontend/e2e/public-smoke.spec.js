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
}

test('landing page locale charge sans compte reel', async ({ page }) => {
  await mockGuestApi(page)

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Moroccan animal community/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' }).first()).toBeVisible()
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
