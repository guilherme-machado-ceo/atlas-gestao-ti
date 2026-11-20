import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const shots = '/tmp/atlas-checks'

async function openReady(page: import('@playwright/test').Page, suffix = '') {
  await page.goto(`/${suffix}`)
  await expect(page.getByRole('heading', { name: 'Uma arquitetura de contenção e atravessamento' })).toBeVisible()
  await page.waitForFunction(() => window.__SCENE_READY__ === true)
}

test('sistema, posição, subárea e item compartilham a mesma seleção', async ({ page }) => {
  const errors: string[] = []
  const missing: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', (response) => { if (response.status() === 404) missing.push(response.url()) })

  await mkdir(shots, { recursive: true })
  await openReady(page)
  await expect(page.locator('.metric-row')).toContainText('41')
  await expect(page.locator('.metric-row')).toContainText('101')
  await expect(page.locator('.metric-row')).toContainText('33')
  await expect(page.locator('.scene-label')).toHaveCount(6)
  await expect(page.locator('.scene-label').filter({ hasText: 'Segurança por Design' })).toBeVisible()
  await page.screenshot({ path: `${shots}/desktop-sistema.png`, fullPage: true })

  await page.locator('.position-button').filter({ hasText: 'Segurança por Design' }).click()
  await expect(page.locator('.detail-panel h2')).toHaveText('Segurança por Design')
  await page.locator('.subarea-list button').filter({ hasText: 'Transição criptográfica' }).click()
  await expect(page.locator('.subarea-detail h3')).toHaveText('Transição criptográfica')
  await page.locator('.item-list button').filter({ hasText: 'Criptografia pós-quântica' }).click()
  await expect(page.locator('.detail-panel h2')).toHaveText('Criptografia pós-quântica')
  await expect(page.locator('.meta-list')).toContainText('carrossel e mapa autoral revisado')
  await expect(page.locator('.breadcrumb')).toContainText('Segurança por Design')
  await expect(page.locator('.breadcrumb')).toContainText('Transição criptográfica')
  await page.screenshot({ path: `${shots}/desktop-item.png`, fullPage: true })

  await page.locator('.toolbar button').filter({ hasText: 'Interseções' }).click()
  await expect(page.locator('.intersection-section .chip-list button')).toHaveCount(2)
  await page.locator('.toolbar button').filter({ hasText: 'Soberania' }).click()
  await expect(page.getByRole('heading', { name: 'Lente de Soberania ativa' })).toBeVisible()
  await expect(page.locator('.explorer')).not.toContainText('Soberania Digital é uma posição')
  await page.screenshot({ path: `${shots}/desktop-lente-intersecoes.png`, fullPage: true })

  await page.locator('.toolbar button').filter({ hasText: 'Vista inicial' }).click()
  await expect(page.locator('.detail-panel h2')).toHaveText('Uma arquitetura de contenção e atravessamento')
  expect(errors).toEqual([])
  expect(missing).toEqual([])
})

test('lista 2D tem as dez interseções e mantém o detalhe do item', async ({ page }) => {
  await openReady(page)
  await page.getByRole('button', { name: 'Lista 2D' }).click()
  await expect(page.locator('.navigator-grid > button')).toHaveCount(6)
  await page.locator('.toolbar button').filter({ hasText: 'Interseções' }).click()
  await expect(page.locator('.intersection-list li')).toHaveCount(10)
  await expect(page.locator('.intersection-list')).toContainText('MLOps e LLMOps operam os modelos da IA aplicada')
  await page.locator('.intersection-endpoints button').filter({ hasText: 'IA aplicada' }).click()
  await expect(page.locator('.navigator-heading h2')).toHaveText('Itens da subárea')
  await page.locator('.navigator-list button').first().click()
  await expect(page.locator('.navigator-item-summary')).toBeVisible()
  await expect(page.locator('.detail-panel h2')).not.toHaveText('Uma arquitetura de contenção e atravessamento')
  await page.screenshot({ path: `${shots}/desktop-2d.png`, fullPage: true })
})

test('mobile funciona sem hover, contém o foco e não cria scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openReady(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Abrir explorador' }).click()
  await expect(page.getByRole('dialog', { name: 'Explorador da arquitetura' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fechar explorador' }).last()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Abrir explorador' })).toBeFocused()
  await page.getByRole('button', { name: 'Abrir explorador' }).click()
  await page.locator('.position-button').filter({ hasText: 'Digital' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.detail-panel h2')).toHaveText('Pilar Digital')
  await page.getByRole('button', { name: 'Lista 2D' }).click()
  await expect(page.locator('.navigator-list button')).toHaveCount(7)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: `${shots}/mobile-375.png`, fullPage: true })
})

test('viewport curta mantém os seis rótulos sem sobreposição', async ({ page }) => {
  await page.setViewportSize({ width: 520, height: 340 })
  await openReady(page, '?capture=1&t=0')
  await page.waitForTimeout(200)
  const labels = page.locator('.scene-label')
  await expect(labels).toHaveCount(6)
  const boxes = await labels.evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect()
    return { name: element.textContent, left: box.left, right: box.right, top: box.top, bottom: box.bottom }
  }))
  await page.screenshot({ path: `${shots}/mobile-curto-520x340.png`, fullPage: true })
  for (let first = 0; first < boxes.length; first += 1) {
    for (let second = first + 1; second < boxes.length; second += 1) {
      const a = boxes[first]
      const b = boxes[second]
      const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
        && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
      expect(overlap, `${a.name} não deve sobrepor ${b.name}: ${JSON.stringify({ a, b })}`).toBe(false)
    }
  }
})

test('movimento reduzido e captura permitem reproduzir o loop deterministicamente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openReady(page, '?capture=1&t=0')
  const canvas = page.locator('canvas')
  const first = await canvas.screenshot()
  await page.evaluate(() => window.__seek?.(8))
  await page.waitForTimeout(150)
  const last = await canvas.screenshot()
  expect(first.equals(last)).toBe(true)
  await page.screenshot({ path: `${shots}/captura-reduced-motion.png`, fullPage: true })
})

test('falha de validação bloqueia todo o conteúdo parcial', async ({ page }) => {
  await page.route('**/data/atlas-modelo-v021-20261120.json', async (route) => {
    const response = await route.fetch()
    const model = await response.json()
    delete model.itens[0].extenso
    await route.fulfill({ response, json: model })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Não foi possível carregar o Atlas' })).toBeVisible()
  await expect(page.locator('.state-page code')).toContainText('campo obrigatório ausente')
  await expect(page.locator('.atlas-layout')).toHaveCount(0)
  await expect(page.locator('.navigator-2d')).toHaveCount(0)
})

test('sonda de desempenho registra estatísticas reais do renderizador', async ({ page }) => {
  await openReady(page)
  await page.waitForFunction(() => Boolean(window.__ATLAS_STATS__), { timeout: 15_000 })
  const stats = await page.evaluate(() => window.__ATLAS_STATS__)
  expect(stats?.drawCalls).toBeGreaterThan(0)
  expect(stats?.triangles).toBeGreaterThan(0)
  expect(stats?.fps).toBeGreaterThan(0)
  console.log('ATLAS_STATS', JSON.stringify(stats))
})
