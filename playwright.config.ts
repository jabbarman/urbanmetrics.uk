import { defineConfig, devices } from "@playwright/test";

const localPort = 3005;
const localBaseUrl = `http://127.0.0.1:${localPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.SITE_URL ?? localBaseUrl,
    trace: "on-first-retry",
  },
  webServer: process.env.SITE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${localPort}`,
        port: localPort,
        reuseExistingServer: false,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
