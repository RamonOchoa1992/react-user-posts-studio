import type { Locator, Page } from "@playwright/test";

/** Page object for the studio: names follow what users see, not DOM structure. */
export class StudioPage {
  constructor(readonly page: Page) {}

  readonly search = this.page.getByRole("searchbox", { name: /buscar usuarios/i });
  readonly detail = this.page.getByRole("region", { name: "Detalle del usuario" });
  readonly profileHeading = this.detail.getByRole("heading", { level: 2 });
  readonly composer = this.page.getByRole("dialog", { name: /nueva publicación/i });

  /** Ready once data is on screen: the directory, or the profile itself (phones hide the list on deep links). */
  async goto(path = "/"): Promise<void> {
    await this.page.goto(path);
    await this.userCard("Leanne Graham").or(this.profileHeading).first().waitFor();
  }

  /** Next.js also renders an (empty) role="alert" route announcer, so alerts are matched by content. */
  errorAlert(title: string): Locator {
    return this.page.getByRole("alert").filter({ hasText: title });
  }

  userCard(name: string): Locator {
    return this.page.getByRole("button", { name: new RegExp(name) });
  }

  feed(authorName: string): Locator {
    return this.page.getByRole("list", { name: `Publicaciones de ${authorName}` });
  }

  async selectUser(name: string): Promise<void> {
    await this.userCard(name).click();
    await this.feed(name).or(this.page.getByText("Aún no hay publicaciones")).waitFor();
  }

  async openComposer(): Promise<Locator> {
    await this.page.getByRole("button", { name: "Nueva publicación", exact: true }).click();
    await this.composer.waitFor();
    return this.composer;
  }

  async fillPost(title: string, body: string): Promise<void> {
    await this.composer.getByLabel("Título").fill(title);
    await this.composer.getByLabel("Contenido").fill(body);
  }

  async publish(): Promise<void> {
    await this.composer.getByRole("button", { name: /^publicar$/i }).click();
  }
}
