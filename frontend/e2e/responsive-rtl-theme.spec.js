import { expect, test } from '@playwright/test'

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

const requestedAppViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

const modes = [
  { locale: 'fr', theme: 'light', dir: 'ltr' },
  { locale: 'fr', theme: 'dark', dir: 'ltr' },
  { locale: 'ar', theme: 'light', dir: 'rtl' },
  { locale: 'ar', theme: 'dark', dir: 'rtl' },
  { locale: 'en', theme: 'light', dir: 'ltr' },
]

const publicRoutes = ['/', '/login', '/register']
const appRoutes = [
  '/feed',
  '/profile',
  '/communities',
  '/communities/1',
  '/marketplace/animals',
  '/marketplace/products',
  '/marketplace/services',
  '/marketplace/veterinarians',
  '/marketplace/animals/1',
  '/marketplace/products/1',
  '/messages',
  '/notifications',
  '/reservations',
  '/orders/history',
  '/settings',
  '/settings/privacy',
  '/admin/stats',
  '/admin/orders',
]

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies()
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
})

for (const viewport of viewports) {
  for (const mode of modes) {
    test(`landing ${viewport.width}x${viewport.height} ${mode.locale} ${mode.theme}`, async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page)
      await page.setViewportSize(viewport)
      await mockApi(page, false)
      await setMode(page, mode)
      await page.goto('/')
      await assertPageHealth(page, mode, consoleErrors)
    })
  }
}

for (const mode of modes) {
  for (const route of publicRoutes.slice(1)) {
    test(`public auth ${route} ${mode.locale} ${mode.theme}`, async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page)
      await page.setViewportSize({ width: 390, height: 844 })
      await mockApi(page, false)
      await setMode(page, mode)
      await page.goto(route)
      await assertPageHealth(page, mode, consoleErrors)
    })
  }
}

for (const route of appRoutes) {
  test(`authenticated app route renders without layout overflow: ${route}`, async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await mockApi(page, true)
    await setMode(page, { locale: 'ar', theme: 'dark', dir: 'rtl' })
    await page.goto(route)
    await assertPageHealth(page, { locale: 'ar', theme: 'dark', dir: 'rtl' }, consoleErrors)
  })
}

for (const viewport of requestedAppViewports) {
  test(`authenticated feed responsive layout ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page)
    await page.setViewportSize(viewport)
    await mockApi(page, true)
    await setMode(page, { locale: 'fr', theme: 'light', dir: 'ltr' })
    await page.goto('/feed')
    await assertPageHealth(page, { locale: 'fr', theme: 'light', dir: 'ltr' }, consoleErrors)

    const sidebar = page.getByTestId('desktop-sidebar')
    const messagesDock = page.getByTestId('desktop-messages-dock')
    const appHeader = page.getByTestId('app-header')

    if (viewport.width >= 1280) {
      await expect(sidebar).toBeVisible()
      await expect(messagesDock).toBeVisible()
    } else {
      await expect(sidebar).toBeHidden()
      await expect(messagesDock).toBeHidden()
    }

    if (viewport.width >= 1024) {
      await expect(appHeader.getByRole('link', { name: 'Feed' })).toBeVisible()
      await expect(appHeader.getByRole('button', { name: 'Messages' })).toHaveCount(0)
    }
  })
}

test('desktop sidebar expands without moving content and supports active sub-routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockApi(page, true)
  await setMode(page, { locale: 'fr', theme: 'light', dir: 'ltr' })
  await page.goto('/marketplace/products')

  const sidebar = page.getByTestId('desktop-sidebar')
  const main = page.locator('#main-content')
  const initialSidebarBox = await sidebar.boundingBox()
  const initialMainBox = await main.boundingBox()

  expect(initialSidebarBox?.width).toBeLessThanOrEqual(82)
  await expect(sidebar.getByRole('link', { name: 'Marché YaZoo' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  await sidebar.hover()
  await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeGreaterThan(240)
  const expandedMainBox = await main.boundingBox()
  expect(expandedMainBox?.x).toBeCloseTo(initialMainBox?.x ?? 0, 0)

  await page.mouse.move(900, 700)
  await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeLessThanOrEqual(82)

  await sidebar.getByRole('link', { name: 'Marché YaZoo' }).focus()
  await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeGreaterThan(240)
})

test('desktop messages dock opens, closes and is absent on the messages page', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await mockApi(page, true)
  await setMode(page, { locale: 'fr', theme: 'dark', dir: 'ltr' })
  await page.goto('/feed')

  const dock = page.getByTestId('desktop-messages-dock')
  await dock.getByRole('button', { name: 'Messages' }).click()
  await expect(dock.getByRole('dialog', { name: 'Messages' })).toBeVisible()
  await dock.getByRole('button', { name: 'Fermer le menu' }).click()
  await expect(dock.getByRole('dialog', { name: 'Messages' })).toHaveCount(0)

  await page.goto('/messages')
  await expect(page.getByTestId('desktop-messages-dock')).toHaveCount(0)
})

test('Arabic desktop sidebar stays on the left and uses RTL internally', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await mockApi(page, true)
  await setMode(page, { locale: 'ar', theme: 'dark', dir: 'rtl' })
  await page.goto('/feed')

  const sidebar = page.getByTestId('desktop-sidebar')
  const sidebarBox = await sidebar.boundingBox()

  await expect(sidebar).toHaveAttribute('dir', 'rtl')
  expect(sidebarBox?.x).toBeLessThanOrEqual(1)
  await expect(sidebar.getByRole('link', { name: 'المجتمعات' })).toBeAttached()
})

async function setMode(page, mode) {
  await page.addInitScript(({ locale, theme }) => {
    window.localStorage.setItem('yazoo-locale', locale)
    window.localStorage.setItem('yazoo-theme', theme)
  }, mode)
}

function collectConsoleErrors(page) {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text()
      if (!text.includes('401 (Unauthorized)')) {
        errors.push(text)
      }
    }
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

async function assertPageHealth(page, mode, consoleErrors) {
  await expect(page.locator('#root')).toBeAttached()
  await expect(page.locator('#root')).not.toBeEmpty()
  await expect(page.locator('html')).toHaveAttribute('lang', mode.locale)
  await expect(page.locator('html')).toHaveAttribute('dir', mode.dir)
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode.theme)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  expect(consoleErrors).toEqual([])
}

async function mockApi(page, authenticated) {
  await page.route('**/sanctum/csrf-cookie', async (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())

    if (!url.pathname.startsWith('/api/')) {
      return route.fallback()
    }

    const path = url.pathname.replace(/^\/api/, '')

    if (path === '/auth/me') {
      return json(route, authenticated ? { user: userFixture } : { message: 'Unauthenticated.' }, authenticated ? 200 : 401)
    }

    if (path === '/posts') return json(route, { data: [], meta: {} })
    if (path === '/stories') return json(route, { data: [] })
    if (path === '/animals') return json(route, { data: [animalFixture], meta: {} })
    if (path === '/animals/1') return json(route, { data: animalFixture })
    if (path === '/products') return json(route, { data: [productFixture], meta: {} })
    if (path === '/products/1') return json(route, { data: productFixture })
    if (path === '/services' || path === '/services/feed') return json(route, { data: [], meta: {} })
    if (path === '/services/types') return json(route, { data: ['pet_sitting', 'training'] })
    if (path === '/veterinarians') return json(route, { data: [], meta: {} })
    if (path === '/communities') return json(route, { data: [communityFixture], meta: {} })
    if (path === '/communities/1') return json(route, { data: communityFixture })
    if (path === '/conversations') return json(route, { data: [] })
    if (path === '/messages/unread-count') {
      return json(route, { data: { unreadCount: 0, unread_count: 0 } })
    }
    if (path === '/notifications') return json(route, { data: [] })
    if (path === '/notifications/unread-count') {
      return json(route, { data: { unreadCount: 0 } })
    }
    if (path === '/reservations') return json(route, { buyerReservations: [], sellerReservations: [], meta: {} })
    if (path === '/orders/history') return json(route, { buyerHistory: [], sellerHistory: [], meta: {} })
    if (path === '/privacy/consents') return json(route, { data: [] })
    if (path === '/privacy/delete-request') return json(route, { data: null })
    if (path.startsWith('/admin/')) return json(route, adminFixture(path))

    return json(route, { data: [] })
  })
}

function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function adminFixture(path) {
  if (path === '/admin/stats') return { users: 1, posts: 0, reports: 0, pendingVerifications: 0 }
  if (path === '/admin/orders') return { stats: {}, pending: [], approved: [], completed: [], cancelled: [] }
  return { data: [], stats: {}, reports: [], moderationActions: [] }
}

const userFixture = {
  id: 1,
  name: 'Admin YaZoo',
  email: 'admin@yazoo.test',
  isAdmin: true,
}

const animalFixture = {
  id: 1,
  name: 'Luna',
  type: 'Chien',
  location: 'Rabat',
  price: 100,
  image: null,
  user: userFixture,
}

const productFixture = {
  id: 1,
  name: 'Panier',
  price: 240,
  location: 'Marrakech',
  image: null,
  author: userFixture,
  user: userFixture,
}

const communityFixture = {
  id: 1,
  name: 'Amis des animaux',
  description: 'Communauté de test',
  isPrivate: false,
  membersCount: 1,
  userRole: 'admin',
}
