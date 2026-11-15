import { describe, expect, it } from "vitest";

import { createPostSchema, POST_BODY_MAX, POST_BODY_MIN, POST_TITLE_MAX, POST_TITLE_MIN } from "./schemas";

const valid = { title: "Un título", body: "Un contenido válido" };
const firstError = (input: unknown) => createPostSchema.safeParse(input).error?.issues[0]?.message;

describe("createPostSchema", () => {
  it("accepts values exactly on the boundaries", () => {
    for (const title of ["a".repeat(POST_TITLE_MIN), "a".repeat(POST_TITLE_MAX)]) {
      for (const body of ["b".repeat(POST_BODY_MIN), "b".repeat(POST_BODY_MAX)]) {
        expect(createPostSchema.safeParse({ title, body }).success).toBe(true);
      }
    }
  });

  it("requires both fields, treating whitespace-only input as empty", () => {
    expect(firstError({ ...valid, title: "" })).toBe("El título es obligatorio.");
    expect(firstError({ ...valid, title: "    " })).toBe("El título es obligatorio.");
    expect(firstError({ ...valid, body: "\n\t " })).toBe("El contenido es obligatorio.");
  });

  it("rejects lengths just outside the allowed range", () => {
    expect(firstError({ ...valid, title: "a".repeat(POST_TITLE_MIN - 1) })).toMatch(/al menos 3/);
    expect(firstError({ ...valid, title: "a".repeat(POST_TITLE_MAX + 1) })).toMatch(/superar los 100/);
    expect(firstError({ ...valid, body: "b".repeat(POST_BODY_MIN - 1) })).toMatch(/al menos 10/);
    expect(firstError({ ...valid, body: "b".repeat(POST_BODY_MAX + 1) })).toMatch(/superar los 500/);
  });

  it("measures length after trimming and returns trimmed values", () => {
    const padded = `  ${"a".repeat(POST_TITLE_MAX)}  `;
    const result = createPostSchema.parse({ title: padded, body: `  ${valid.body}  ` });
    expect(result).toEqual({ title: "a".repeat(POST_TITLE_MAX), body: valid.body });
    expect(firstError({ ...valid, title: "  ab  " })).toMatch(/al menos 3/);
  });
});
