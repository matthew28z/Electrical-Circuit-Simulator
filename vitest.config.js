import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

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
        mouseMove: async ({ page }, frameBox, x, y) => {
          const viewport = await page.evaluate(() => {
            return {
              width: window.innerWidth,
              height: window.innerHeight,
            }
          });

          const pointInFrame = { x: frameBox.x + x * frameBox.width / viewport.width, y: frameBox.y + y * frameBox.height / viewport.height }
          
          await page.mouse.move(pointInFrame.x, pointInFrame.y);

          return pointInFrame;
        },
        getPositionGlobal: async ({ page }, testID) => { 
          //We need to specifically target the iframe
          const { x, y } = await page.frameLocator('iframe').getByTestId(testID).boundingBox({ timeout: 1000 });

          return { x, y };
        },
        getBoxOfFrame: async ({ page }) => {
          return await page.locator('iframe').boundingBox();
        }
      }
    },
  },
})
