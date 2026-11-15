import { test as base, type Page, type Route } from "@playwright/test";

import { posts, users } from "@/test/fixtures";

export { expect } from "@playwright/test";

const API_ORIGIN = "https://jsonplaceholder.typicode.com";
/** JSONPlaceholder answers every create with id 101; the mock mirrors that quirk. */
const CREATED_POST_ID = 101;

type Failure = { status: number } | "network";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deterministic stand-in for JSONPlaceholder, installed at the network layer of
 * the browser (`page.route`): the app runs unmodified, only its responses are
 * controlled. Failures are queued per endpoint so a test can script "fail once,
 * then recover" flows.
 */
export class MockApi {
  readonly createdPosts: unknown[] = [];
  private readonly usersFailures: Failure[] = [];
  private readonly createFailures: Failure[] = [];

  failUsersOnce(failure: Failure = { status: 503 }): void {
    this.usersFailures.push(failure);
  }

  failCreateOnce(failure: Failure = { status: 500 }): void {
    this.createFailures.push(failure);
  }

  async install(page: Page): Promise<void> {
    await page.route(`${API_ORIGIN}/**`, (route) => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const { pathname, searchParams } = new URL(request.url());
    const method = request.method();

    if (method === "GET" && pathname === "/users") {
      const failure = this.usersFailures.shift();
      return failure ? this.fail(route, failure) : route.fulfill({ json: users });
    }

    if (method === "GET" && pathname === "/posts") {
      const userId = Number(searchParams.get("userId"));
      return route.fulfill({ json: posts.filter((post) => post.userId === userId) });
    }

    if (method === "POST" && pathname === "/posts") {
      const failure = this.createFailures.shift();
      if (failure) return this.fail(route, failure);
      const body: unknown = request.postDataJSON();
      this.createdPosts.push(body);
      return route.fulfill({ status: 201, json: { ...(isRecord(body) ? body : {}), id: CREATED_POST_ID } });
    }

    return route.fulfill({ status: 404, json: {} });
  }

  private fail(route: Route, failure: Failure): Promise<void> {
    return failure === "network"
      ? route.abort("internetdisconnected")
      : route.fulfill({ status: failure.status, json: {} });
  }
}

/** Every test gets an isolated, pre-installed API mock. Use `@playwright/test` directly for live checks. */
export const test = base.extend<{ api: MockApi }>({
  // `auto`: installed even when a test does not destructure `api`, so no test can hit the real API by accident.
  api: [
    async ({ page }, use) => {
      const api = new MockApi();
      await api.install(page);
      await use(api);
    },
    { auto: true },
  ],
});
