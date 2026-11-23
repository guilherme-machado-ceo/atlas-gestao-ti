import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { EDITORIAL_MANIFEST } from '../src/editorial/security-sample'

async function openProtocol(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Protocolo Geral de Tecnologia' })).toBeVisible()
  await expect(page.locator('.protocol-thesis')).toBeVisible()
}

test('a leitura do Protocolo é a experiência inicial e não carrega o módulo 3D', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))

  await openProtocol(page)
  await expect(page.getByRole('button', { name: 'Protocolo' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.protocol-subarea')).toHaveCount(9)
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(requests.some((url) => /AtlasScene|three\.module|three\.core/.test(url))).toBe(false)
  await expect(page.locator('.protocol-thesis-meta')).toContainText('101 itens taxonômicos pesquisáveis')
})

test('a amostra de Segurança preserva as nove subáreas e vinte itens', async ({ page }) => {
  await openProtocol(page)
  const subareas = page.locator('.protocol-subarea')
  await expect(subareas).toHaveCount(9)

  await subareas.evaluateAll((elements) => elements.forEach((element) => {
    (element as HTMLDetailsElement).open = true
  }))
  await expect(page.locator('.protocol-item')).toHaveCount(20)

  const transition = page.locator('.protocol-subarea').filter({ hasText: 'Transição criptográfica' })
  await expect(transition).toHaveAttribute('open', '')
  await transition.locator('.protocol-item').filter({ hasText: 'Criptografia pós-quântica' }).locator('summary').click()
  await expect(transition).toContainText('FIPS 203 / ML-KEM')
  await expect(transition).toContainText('FIPS 204 / ML-DSA')
  await expect(transition).toContainText('FIPS 205 / SLH-DSA')
  await expect(transition).toContainText('harvest now, decrypt later')
  await expect(transition).toContainText('linhas 517–529')
  await expect(transition).toContainText('r23')
  await expect(transition).toContainText('r24')
  await expect(transition).toContainText('r30')
  await expect(transition).toContainText('Origem do impacto e local da resposta são distintos.')
  await expect(page.locator('.protocol-subarea').filter({ hasText: 'Controles de proteção' })).toContainText('Lacuna documental')
})

test('a busca indexa os 101 itens e identifica lacunas fora da amostra', async ({ page }) => {
  await openProtocol(page)
  const search = page.getByRole('searchbox', { name: 'Buscar nas posições, subáreas, itens e texto editorial' })

  await search.fill('PQC')
  await expect(page.locator('.search-results')).toContainText('Criptografia pós-quântica')
  await expect(page.locator('.search-results')).toContainText('ML-KEM')

  await search.fill('CIEM')
  await expect(page.locator('.search-results')).toContainText('CIEM')
  await expect(page.locator('.search-results')).toContainText('Lacuna documental')

  await search.fill('Scrum')
  await expect(page.locator('.search-results')).toContainText('Scrum')
  await expect(page.locator('.search-results')).toContainText('Somente taxonômico — fora da amostra')
})

test('Mapa 2D permite navegar por posições, subáreas e itens sem WebGL', async ({ page }) => {
  await openProtocol(page)
  await page.getByRole('button', { name: 'Mapa 2D' }).click()
  await expect(page.locator('.navigator-grid > button')).toHaveCount(6)

  await page.locator('.navigator-grid > button').filter({ hasText: 'Segurança por Design' }).click()
  await expect(page.locator('.navigator-list button')).toHaveCount(9)
  await page.locator('.navigator-list button').filter({ hasText: 'Transição criptográfica' }).click()
  await expect(page.locator('.navigator-list button')).toHaveCount(4)
  await page.locator('.navigator-list button').filter({ hasText: 'Criptografia pós-quântica' }).click()
  await expect(page.locator('.navigator-item-summary')).toContainText('Criptografia pós-quântica')
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('Atlas 3D só é carregado após solicitação explícita e reage à perda de contexto', async ({ page }) => {
  await openProtocol(page)
  await expect(page.locator('canvas')).toHaveCount(0)

  await page.getByRole('button', { name: 'Atlas 3D' }).click()
  await expect(page.locator('canvas')).toHaveCount(1, { timeout: 20_000 })
  await page.waitForFunction(() => window.__SCENE_READY__ === true, { timeout: 20_000 })

  await page.locator('canvas').evaluate((canvas) => {
    canvas.dispatchEvent(new Event('webglcontextlost', { bubbles: false, cancelable: true }))
  })
  await expect(page.locator('.scene-notice')).toContainText('contexto WebGL foi perdido')
  await expect(page.locator('.navigator-2d')).toBeVisible()
})

test('WebGL2 indisponível faz fallback automático para o Mapa 2D', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl2') return null
      return original.call(this, type as never, ...(args as never[]))
    }
  })
  await openProtocol(page)
  await page.getByRole('button', { name: 'Atlas 3D' }).click()
  await expect(page.locator('.scene-notice')).toContainText('WebGL 2 não está disponível')
  await expect(page.locator('.navigator-2d')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('a amostra documenta proveniência, licença, limites e integridade do modelo', async ({ page }) => {
  const modelPath = new URL('../public/data/atlas-modelo-v021-20261120.json', import.meta.url)
  const modelBytes = await readFile(modelPath)
  const actualHash = createHash('sha256').update(modelBytes).digest('hex')
  expect(actualHash).toBe(EDITORIAL_MANIFEST.compatibility.modelSha256)

  await openProtocol(page)
  await page.getByRole('button', { name: 'Fontes e método' }).click()
  await expect(page.getByRole('heading', { name: 'Fontes e método' })).toBeVisible()
  await expect(page.locator('.sources-page')).toContainText('CC BY 4.0')
  await expect(page.locator('.sources-page')).toContainText('documento + versão + seção + intervalo de linhas')
  await expect(page.locator('.sources-page')).toContainText('15 diretos, 24 parciais e 62 lacunas')
  await expect(page.locator('.sources-page')).toContainText('r12–r16, r22 e r33')
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('um JSON estrutural alterado é rejeitado antes de renderizar conteúdo parcial', async ({ page }) => {
  await page.route('**/data/atlas-modelo-v021-20261120.json', async (route) => {
    const response = await route.fetch()
    const raw = await response.text()
    const tampered = raw.replace('"versao_modelo": "0.2.1"', '"versao_modelo": "0.2.2"')
    await route.fulfill({ response, body: tampered })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Não foi possível carregar o Atlas' })).toBeVisible()
  await expect(page.locator('.state-page code')).toContainText('SHA-256 do modelo estrutural')
  await expect(page.locator('.protocol-page')).toHaveCount(0)
  await expect(page.locator('.navigator-2d')).toHaveCount(0)
})

test('mobile mantém busca, acordeões e navegação sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openProtocol(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  const transition = page.locator('.protocol-subarea').filter({ hasText: 'Transição criptográfica' })
  await expect(transition).toHaveAttribute('open', '')
  const subareaSummary = transition.locator(':scope > summary')
  await subareaSummary.focus()
  await page.keyboard.press('Enter')
  await expect(transition).not.toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(transition).toHaveAttribute('open', '')

  await transition.locator('.protocol-item').filter({ hasText: 'Criptografia pós-quântica' }).locator('summary').click()
  await expect(transition).toContainText('Agilidade e inventário')
  await page.getByRole('searchbox', { name: 'Buscar nas posições, subáreas, itens e texto editorial' }).fill('LGPD')
  await expect(page.locator('.search-results')).toContainText('LGPD')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Hubstry branding, favicon e selo NVIDIA Inception carregam', async ({ page }) => {
  await openProtocol(page)
  await expect(page.locator('.brand-hubstry')).toBeVisible()
  await expect(page.locator('.brand-hubstry')).toHaveAttribute('src', './hubstry-wordmark-v2.svg')
  await expect(page.locator('.nvidia-inception-badge img')).toBeAttached()
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href', './hubstry-favicon-32.png')

  await expect.poll(() => page.locator('.brand-hubstry').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(958)
  await expect.poll(() => page.locator('.nvidia-inception-badge img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(501)
})
