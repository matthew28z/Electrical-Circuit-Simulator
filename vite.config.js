import { defineConfig } from 'vite'
import { playwright } from '@vitest/browser-playwright';
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Inspect()
  ],

  test: {
    browser: {
      enabled: true,
      viewport: { width: 1280, height: 720 },
      instances: [
        { 
          browser: "chromium", 
          headless: false, // So you can see your circuit!
          contextConfig: {
          deviceScaleFactor: 1, // Standard desktop zoom
          isMobile: false,      // Explicitly turn off mobile emulation
          hasTouch: false
      },
        },
      ],
      provider: playwright(),
    },
    setupFiles: ["./tests/setup.js"],
    environment: "node",
    globals: true,
    isolate: true
  }
})