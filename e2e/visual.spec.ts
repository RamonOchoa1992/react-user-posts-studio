import type { Page } from "@playwright/test";

import { StudioPage } from "./support/studio";
import { expect, test } from "./support/test";

/**
 * Visual regression. Baselines depend on OS font rendering, so they are kept out
 * of git: create them with `npm run e2e:visual:update`, then compare with
 * `npm run e2e:visual` after any UI change.
 */
test.describe("Visual regression", { tag: "@visual" }, () => {
  async function settle(page: Page): Promise<void> {
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
  }

  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(colorScheme, () => {
      test.use({ colorScheme });

      test("directory", async ({ page }) => {
        await new StudioPage(page).goto();
        await settle(page);
        await expect(page).toHaveScreenshot(`directory-${colorScheme}.png`);
      });

      test("profile", async ({ page }) => {
        const studio = new StudioPage(page);
        await studio.goto("/?user=1");
        await expect(studio.feed("Leanne Graham")).toBeVisible();
        await settle(page);
        await expect(page).toHaveScreenshot(`profile-${colorScheme}.png`);
      });

      test("composer errors", async ({ page }) => {
        const studio = new StudioPage(page);
        await studio.goto("/?user=1");
        await studio.openComposer();
        await studio.publish();
        await expect(studio.composer.getByText("El título es obligatorio.")).toBeVisible();
        await settle(page);
        await expect(page).toHaveScreenshot(`composer-errors-${colorScheme}.png`);
      });

      test("error state", async ({ page, api }) => {
        api.failUsersOnce({ status: 503 });
        await page.goto("/");
        await expect(new StudioPage(page).errorAlert("No pudimos cargar los usuarios")).toBeVisible();
        await settle(page);
        await expect(page).toHaveScreenshot(`error-${colorScheme}.png`);
      });
    });
  }
});
