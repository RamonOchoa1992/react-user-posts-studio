import type { Page } from "@playwright/test";

import { StudioPage } from "./support/studio";
import { expect, test } from "./support/test";

const MIN_TOUCH_TARGET = 36;

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

/** Interactive elements smaller than a comfortable touch target (inline text links excluded by design). */
async function smallTouchTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    return [...document.querySelectorAll<HTMLElement>("button, a[href], input, textarea")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && Math.min(box.width, box.height) < min;
      })
      .map((element) => element.getAttribute("aria-label") ?? element.textContent?.trim() ?? element.tagName);
  }, MIN_TOUCH_TARGET);
}

test.describe("Studio · mobile journeys", () => {
  test.skip(({ isMobile }) => !isMobile, "Phone layout only");

  test("list and detail behave like native push navigation", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();

    await studio.userCard("Leanne Graham").tap();
    await expect(studio.profileHeading).toHaveText("Leanne Graham");
    await expect(studio.search).toBeHidden();

    await page.getByRole("button", { name: "Volver" }).tap();
    await expect(studio.search).toBeVisible();
    await expect(studio.profileHeading).toBeHidden();

    // The OS back gesture walks the same history.
    await studio.userCard("Ervin Howell").tap();
    await expect(studio.profileHeading).toHaveText("Ervin Howell");
    await page.goBack();
    await expect(studio.search).toBeVisible();
  });

  test("the compact title appears in the sticky bar once the profile scrolls away", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto("/?user=1");
    const compactTitle = page.locator("div[aria-hidden]").filter({ hasText: /^Leanne Graham/ });

    await expect(compactTitle).toHaveCSS("opacity", "0");
    await page
      .locator(".overflow-y-auto")
      .last()
      .evaluate((element) => element.scrollTo({ top: 600 }));
    await expect(compactTitle).toHaveCSS("opacity", "1");
  });

  test("the floating button opens a bottom sheet that publishes a post", async ({ page, api }) => {
    const studio = new StudioPage(page);
    await studio.goto("/?user=1");

    await page.getByRole("button", { name: "Nueva publicación" }).tap();
    const sheet = studio.composer;
    await expect(sheet).toBeVisible();

    // Anchored to the bottom edge once the slide-in animation settles.
    const sheetBottom = async () => {
      const box = await sheet.boundingBox();
      return box ? Math.round(box.y + box.height) : null;
    };
    await expect.poll(sheetBottom).toBe(page.viewportSize()?.height);

    await studio.fillPost("Desde el móvil", "Publicado con el pulgar desde el bottom sheet.");
    await sheet.getByRole("button", { name: /^publicar$/i }).tap();

    await expect(sheet).toBeHidden();
    await expect(studio.feed("Leanne Graham").getByRole("article").first()).toContainText("Desde el móvil");
    expect(api.createdPosts).toHaveLength(1);
  });

  test("no screen overflows horizontally and every control is comfortable to tap", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    expect(await hasHorizontalOverflow(page)).toBe(false);
    expect(await smallTouchTargets(page)).toEqual([]);

    await studio.userCard("Leanne Graham").tap();
    await expect(studio.profileHeading).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
    expect(await smallTouchTargets(page)).toEqual([]);

    await page.getByRole("button", { name: "Nueva publicación" }).tap();
    await expect(studio.composer).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
