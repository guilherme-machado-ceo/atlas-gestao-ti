import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const systemChromium = '/usr/bin/chromium'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync(systemChromium) ? systemChromium : undefined)

export default defineConfig({
  testDir: './tests',
  outputDir: '/tmp/atlas-playwright',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 960 },
    headless: true,
    launchOptions: { executablePath, args: ['--use-angle=swiftshader', '--enable-webgl'] },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
