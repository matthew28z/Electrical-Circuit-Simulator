import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    isolate: true,
    setupFiles: ["./tests/setup.js"],
    headless: false,
    browser: {
      viewport: { width: 1920, height: 1080 },
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      commands: { //Allows me to simulate holding the mouse down
        mouseDown: async ({ page }) => {
          await page.mouse.down();
        },
        mouseUp: async ({ page }) => {
          await page.mouse.up();
        },
        mouseMove: async ({ page }, { x, y }) => {
          await page.mouse.move(x, y);
        }
      }
    },
  },
})
