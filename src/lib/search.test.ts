import { describe, expect, it } from "vitest";

import { matchesQuery, splitByMatch } from "./search";

describe("matchesQuery", () => {
  it("ignores case, accents and surrounding whitespace", () => {
    expect(matchesQuery("José Martínez", "  jose MARTINEZ ")).toBe(true);
    expect(matchesQuery("Leanne Graham", "GRAH")).toBe(true);
    expect(matchesQuery("Leanne Graham", "ervin")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery("Anyone", "   ")).toBe(true);
  });
});

describe("splitByMatch", () => {
  it("splits the text around the first match, preserving the original casing", () => {
    expect(splitByMatch("Leanne Graham", "graham")).toEqual([
      { text: "Leanne ", isMatch: false },
      { text: "Graham", isMatch: true },
    ]);
  });

  it("highlights accented text matched by an unaccented query", () => {
    expect(splitByMatch("Ramón", "ramon")).toEqual([{ text: "Ramón", isMatch: true }]);
  });

  it("returns the text untouched when nothing matches", () => {
    expect(splitByMatch("Leanne Graham", "xyz")).toEqual([{ text: "Leanne Graham", isMatch: false }]);
  });
});
