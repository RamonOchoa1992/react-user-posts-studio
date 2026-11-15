import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { StudioPage } from "./support/studio";
import { expect, test } from "./support/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target.join(" ")),
  }));
  expect(summary).toEqual([]);
}

/** WCAG 2.2 AA regression guard for every key state, in both color schemes and on both layouts. */
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`Accessibility · ${colorScheme}`, () => {
    test.use({ colorScheme });

    test("directory", async ({ page }) => {
      await new StudioPage(page).goto();
      await expectNoViolations(page);
    });

    test("profile and feed", async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto("/?user=1");
      await expect(studio.feed("Leanne Graham")).toBeVisible();
      await expectNoViolations(page);
    });

    test("composer with validation errors", async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto("/?user=1");
      await studio.openComposer();
      await studio.publish();
      await expect(studio.composer.getByText("El título es obligatorio.")).toBeVisible();
      await expectNoViolations(page);
    });

    test("error state", async ({ page, api }) => {
      api.failUsersOnce({ status: 503 });
      await page.goto("/");
      await expect(new StudioPage(page).errorAlert("No pudimos cargar los usuarios")).toBeVisible();
      await expectNoViolations(page);
    });
  });
}
