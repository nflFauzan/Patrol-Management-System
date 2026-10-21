import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    geolocation: { latitude: -6.2215, longitude: 106.8055 }, // SCBD Head Office
    permissions: ['geolocation', 'camera'],
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
  webServer: [
    {
      command: 'npm run preview --workspace=@patrol/pwa-field -- --port 5173',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run start --workspace=@patrol/web-admin',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
  projects: [
    {
      name: 'Mobile Chrome (PWA)',
      testMatch: '**/pwa-field-flow.spec.ts',
      use: { ...devices['Pixel 5'], baseURL: 'https://localhost:5173', ignoreHTTPSErrors: true },
    },
    {
      name: 'Desktop Chrome (Web Admin)',
      testMatch: '**/*{admin,personil,chief}*.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' },
    },
  ],
});
