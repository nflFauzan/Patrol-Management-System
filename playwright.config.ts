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
  },
  projects: [
    {
      name: 'Mobile Chrome (PWA)',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Desktop Chrome (Admin)',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
  ],
});
