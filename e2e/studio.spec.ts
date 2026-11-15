import { StudioPage } from "./support/studio";
import { expect, test } from "./support/test";

/** Critical desktop journeys: the regression suite that must stay green before any release. */
test.describe("Studio · desktop journeys", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout only");

  test("search filters the directory and selection is reflected in the URL and history", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();

    await studio.search.fill("CLEM");
    await expect(studio.userCard("Clementine Bauch")).toBeVisible();
    await expect(studio.userCard("Leanne Graham")).toBeHidden();
    await expect(page.getByText("1 de 3")).toBeVisible();

    await studio.search.press("Escape");
    await expect(studio.search).toHaveValue("");

    await studio.selectUser("Leanne Graham");
    await expect(page).toHaveURL(/\?user=1$/);
    await expect(studio.profileHeading).toHaveText("Leanne Graham");
    await expect(studio.feed("Leanne Graham").getByRole("article")).toHaveCount(2);

    await studio.selectUser("Ervin Howell");
    await expect(page).toHaveURL(/\?user=2$/);

    await page.goBack();
    await expect(page).toHaveURL(/\?user=1$/);
    await expect(studio.profileHeading).toHaveText("Leanne Graham");
  });

  test("a deep link opens the profile directly and survives a reload", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto("/?user=2");

    await expect(studio.profileHeading).toHaveText("Ervin Howell");
    await page.reload();
    await expect(studio.profileHeading).toHaveText("Ervin Howell");
  });

  test("an API outage shows a recoverable error state", async ({ page, api }) => {
    api.failUsersOnce({ status: 503 });
    await page.goto("/");

    const alert = new StudioPage(page).errorAlert("No pudimos cargar los usuarios");
    await expect(alert).toContainText("No pudimos cargar los usuarios");
    await expect(alert).toContainText("503");

    await alert.getByRole("button", { name: "Reintentar" }).click();
    await expect(new StudioPage(page).userCard("Leanne Graham")).toBeVisible();
  });

  test("the simulated network failure can be triggered and recovered from", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();

    await page.getByRole("button", { name: "Simular error de red" }).click();
    const alert = studio.errorAlert("No pudimos cargar los usuarios");
    await expect(alert).toContainText(/fallo de red simulado/i);

    await alert.getByRole("button", { name: "Reintentar" }).click();
    await expect(studio.userCard("Leanne Graham")).toBeVisible();
  });

  test("creating a post validates input, publishes optimistically and keeps it across profiles", async ({
    page,
    api,
  }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.selectUser("Leanne Graham");
    const composer = await studio.openComposer();

    await studio.publish();
    await expect(composer.getByText("El título es obligatorio.")).toBeVisible();
    await expect(composer.getByText("El contenido es obligatorio.")).toBeVisible();

    // Enter in the title moves on to the body instead of submitting.
    await composer.getByLabel("Título").fill("  Notas de la release  ");
    await composer.getByLabel("Título").press("Enter");
    await expect(composer.getByLabel("Contenido")).toBeFocused();
    await page.keyboard.type("Todo verde: tipos, lint, tests y build.");
    await expect(composer.getByText(/^\d+\/500$/)).toHaveText("39/500");

    await page.keyboard.press("Control+Enter");
    await expect(composer).toBeHidden();

    const firstPost = studio.feed("Leanne Graham").getByRole("article").first();
    await expect(firstPost).toContainText("Notas de la release");
    await expect(firstPost).toContainText("Nuevo");
    await expect(page.getByText("Publicado en el perfil de Leanne")).toBeVisible();
    expect(api.createdPosts).toEqual([
      { userId: 1, title: "Notas de la release", body: "Todo verde: tipos, lint, tests y build." },
    ]);

    await studio.selectUser("Ervin Howell");
    await studio.selectUser("Leanne Graham");
    await expect(studio.feed("Leanne Graham").getByRole("article").first()).toContainText("Notas de la release");
  });

  test("a rejected post is rolled back and the error is reported", async ({ page, api }) => {
    api.failCreateOnce({ status: 500 });
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.selectUser("Leanne Graham");
    await studio.openComposer();
    await studio.fillPost("Esto fallará", "El servidor rechazará esta publicación.");
    await studio.publish();

    await expect(page.getByText(/el servidor tuvo un problema \(500\)/i)).toBeVisible();
    await expect(page.getByText("Esto fallará")).toBeHidden();
    await expect(studio.feed("Leanne Graham").getByRole("article")).toHaveCount(2);
  });

  test("a user without posts gets an inviting empty state", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.selectUser("Clementine Bauch");

    await expect(page.getByText("Aún no hay publicaciones")).toBeVisible();
  });

  test("keyboard: '/' focuses the search from anywhere", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await page.locator("body").click();

    await page.keyboard.press("/");
    await expect(studio.search).toBeFocused();
  });

  test("copying the email writes it to the clipboard and confirms it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const studio = new StudioPage(page);
    await studio.goto("/?user=1");

    await page.getByRole("button", { name: "Copiar email" }).click();

    await expect(page.getByText("Email copiado").first()).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("Sincere@april.biz");
  });

  test("the theme toggle switches to dark mode and the choice persists", async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    const initial = await isDark();

    await page.getByRole("button", { name: "Cambiar entre tema claro y oscuro" }).click();
    await expect.poll(isDark).toBe(!initial);

    await page.reload();
    await expect.poll(isDark).toBe(!initial);
  });
});
