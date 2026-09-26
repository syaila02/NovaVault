import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.TARGET_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1366, height: 768 },
    screenshot: 'on',
    video: 'off',
    trace: 'on-first-retry',
    channel: 'chrome'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000
  }
});
