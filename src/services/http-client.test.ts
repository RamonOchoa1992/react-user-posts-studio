import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { apiUrl, server } from "@/test/msw";

import { ApiError } from "./api-error";
import { request } from "./http-client";

const itemSchema = z.object({ id: z.number(), name: z.string() });

describe("request", () => {
  it("returns the payload once it matches the schema", async () => {
    server.use(http.get(apiUrl("/items/1"), () => HttpResponse.json({ id: 1, name: "ok", extra: true })));

    await expect(request("/items/1", itemSchema)).resolves.toEqual({ id: 1, name: "ok" });
  });

  it("maps HTTP errors to an ApiError carrying the status", async () => {
    server.use(http.get(apiUrl("/items/1"), () => HttpResponse.json(null, { status: 404 })));

    await expect(request("/items/1", itemSchema)).rejects.toMatchObject({ kind: "http", status: 404 });
  });

  it("rejects payloads that break the contract instead of leaking them to the UI", async () => {
    server.use(http.get(apiUrl("/items/1"), () => HttpResponse.json({ id: "1" })));

    await expect(request("/items/1", itemSchema)).rejects.toMatchObject({ kind: "invalid-response" });
  });

  it("maps connection failures to a network ApiError", async () => {
    server.use(http.get(apiUrl("/items/1"), () => HttpResponse.error()));

    await expect(request("/items/1", itemSchema)).rejects.toMatchObject({ kind: "network" });
  });

  it("aborts slow requests after the timeout", async () => {
    server.use(
      http.get(apiUrl("/items/1"), async () => {
        await delay("infinite");
        return HttpResponse.json({ id: 1, name: "late" });
      }),
    );

    const error = await request("/items/1", itemSchema, { timeoutMs: 50 }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "timeout" });
  });

  it("propagates caller cancellation as an AbortError, not as a failure", async () => {
    server.use(
      http.get(apiUrl("/items/1"), async () => {
        await delay("infinite");
        return HttpResponse.json({ id: 1, name: "late" });
      }),
    );
    const controller = new AbortController();

    const pending = request("/items/1", itemSchema, { signal: controller.signal });
    controller.abort();

    const error = await pending.catch((caught: unknown) => caught);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ name: "AbortError" });
  });

  it("sends JSON bodies with the right headers", async () => {
    let contentType: string | null = null;
    let received: unknown;
    server.use(
      http.post(apiUrl("/items"), async ({ request: incoming }) => {
        contentType = incoming.headers.get("content-type");
        received = await incoming.json();
        return HttpResponse.json({ id: 2, name: "created" }, { status: 201 });
      }),
    );

    await request("/items", itemSchema, { method: "POST", body: { name: "created" } });

    expect(contentType).toMatch(/application\/json/);
    expect(received).toEqual({ name: "created" });
  });
});
