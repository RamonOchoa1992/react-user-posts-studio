import { expect, test } from "@playwright/test";

/**
 * Contract smoke test against the real JSONPlaceholder (no mocks). Tagged @live
 * so CI can skip it when the third-party API is unreachable.
 */
test.describe("Live API smoke", { tag: "@live" }, () => {
  test.skip(({ isMobile }) => isMobile, "One run is enough for a contract check");

  test("loads the real directory and a real feed", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("10 usuarios")).toBeVisible();
    await page.getByRole("button", { name: /Leanne Graham/ }).click();

    const detail = page.getByRole("region", { name: "Detalle del usuario" });
    await expect(detail.getByRole("heading", { level: 2 })).toHaveText("Leanne Graham");
    await expect(page.getByRole("list", { name: "Publicaciones de Leanne Graham" }).getByRole("article")).toHaveCount(
      10,
    );
  });
});
