import { describe, expect, it } from "vitest";

import { getAvatarGradient, getInitials, GRADIENT_HUES } from "./avatar";

describe("getInitials", () => {
  it.each([
    ["Leanne Graham", "LG"],
    ["Mrs. Dennis Schulist", "DS"],
    ["Nicholas Runolfsdottir V", "NR"],
    ["Clementina DuBuque", "CD"],
    ["ana maría lópez", "AL"],
    ["Cher", "C"],
    ["  ", "?"],
  ])("%j → %j", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});

describe("getAvatarGradient", () => {
  it("is deterministic for the same seed", () => {
    expect(getAvatarGradient("Bret")).toEqual(getAvatarGradient("Bret"));
  });

  it("always picks one of the curated hue pairs", () => {
    const curated = new Set(GRADIENT_HUES.map(([from, to]) => `${from}/${to}`));
    for (const seed of ["Bret", "Antonette", "Samantha", "Karianne", "Kamren", "Leopoldo_Corkery"]) {
      const { from, to } = getAvatarGradient(seed);
      const hue = (color: string) => color.match(/(\d+)\)$/)?.[1];
      expect(curated.has(`${hue(from)}/${hue(to)}`)).toBe(true);
    }
  });

  it("spreads different users across different gradients", () => {
    const seeds = ["Bret", "Antonette", "Samantha", "Karianne", "Kamren", "Leopoldo_Corkery", "Elwyn.Skiles"];
    const distinct = new Set(seeds.map((seed) => JSON.stringify(getAvatarGradient(seed))));
    expect(distinct.size).toBe(seeds.length);
  });
});
