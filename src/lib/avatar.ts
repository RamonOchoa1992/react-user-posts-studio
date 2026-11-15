/** Honorifics and generational suffixes that should never become an initial. */
const NAME_AFFIXES = new Set(["mr", "mrs", "ms", "miss", "dr", "prof", "sr", "sra", "jr", "ii", "iii", "iv", "v"]);

export function getInitials(fullName: string): string {
  const words = fullName
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 0);

  const meaningful = words.filter((word) => !NAME_AFFIXES.has(word.toLowerCase()));
  const [first, ...rest] = meaningful.length > 0 ? meaningful : words;
  if (first === undefined) return "?";

  const last = rest.at(-1) ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase();
}

/** FNV-1a: tiny, fast and well distributed — enough to spread hues evenly. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface AvatarGradient {
  from: string;
  to: string;
  angle: number;
}

type HuePair = readonly [from: number, to: number];

/**
 * Curated analogous hue pairs (OKLCH). Picking from a vetted set instead of the
 * full wheel keeps every gradient harmonious: no muddy olives or browns.
 */
export const GRADIENT_HUES: readonly HuePair[] = [
  [277, 305], // indigo → violet
  [255, 280], // blue → indigo
  [230, 258], // sky → blue
  [200, 232], // cyan → sky
  [168, 198], // emerald → cyan
  [150, 172], // green → emerald
  [305, 335], // violet → fuchsia
  [335, 5], // pink → rose
  [12, 35], // rose → coral
  [30, 52], // coral → orange
];
const FALLBACK_HUES: HuePair = [277, 305];

/**
 * Deterministic two-stop gradient: same seed, same avatar, on every device.
 * Fixed lightness/chroma keep white initials legible in both themes.
 */
export function getAvatarGradient(seed: string): AvatarGradient {
  const hash = hashString(seed);
  const [fromHue, toHue] = GRADIENT_HUES[hash % GRADIENT_HUES.length] ?? FALLBACK_HUES;
  const angle = 120 + ((hash >>> 8) % 90);

  return {
    from: `oklch(0.7 0.15 ${fromHue})`,
    to: `oklch(0.55 0.19 ${toHue})`,
    angle,
  };
}

export function toCssGradient({ from, to, angle }: AvatarGradient): string {
  return `linear-gradient(${angle}deg, ${from}, ${to})`;
}
