import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    geolocation: { latitude: -6.2215, longitude: 106.8055 }, // SCBD Head Office
    permissions: ['geolocation', 'camera'],
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
  webServer: {
    command: 'npm run preview --workspace=@patrol/pwa-field -- --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: 'Mobile Chrome (PWA)',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
