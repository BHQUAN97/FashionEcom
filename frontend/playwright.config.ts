import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config — FashionEcom storefront
 * Chay: npm run test:e2e
 * Dev server tu dong start tai port 3300
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3300',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  webServer: {
    command: 'npx next dev --port 3300',
    port: 3300,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
