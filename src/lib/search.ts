/** Case- and accent-insensitive form used for matching ("José" matches "jose"). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

export function matchesQuery(text: string, query: string): boolean {
  const needle = normalizeForSearch(query.trim());
  return needle.length === 0 || normalizeForSearch(text).includes(needle);
}

export interface TextSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Splits `text` around the first match of `query` for highlighting. Falls back
 * to a single plain segment when normalisation changes the string length,
 * because indices would no longer line up with the original text.
 */
export function splitByMatch(text: string, query: string): TextSegment[] {
  const needle = normalizeForSearch(query.trim());
  const haystack = normalizeForSearch(text);
  const start = needle.length > 0 && haystack.length === text.length ? haystack.indexOf(needle) : -1;

  if (start === -1) return [{ text, isMatch: false }];

  const end = start + needle.length;
  return [
    { text: text.slice(0, start), isMatch: false },
    { text: text.slice(start, end), isMatch: true },
    { text: text.slice(end), isMatch: false },
  ].filter((segment) => segment.text.length > 0);
}
