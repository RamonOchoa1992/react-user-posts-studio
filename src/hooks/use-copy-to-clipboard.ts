"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardResult {
  isCopied: boolean;
  /** Resolves to `false` when the Clipboard API is unavailable or denied. */
  copy: (value: string) => Promise<boolean>;
}

export function useCopyToClipboard(resetAfterMs = 2000): UseCopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = useCallback(
    async (value: string) => {
      try {
        if (typeof navigator === "undefined" || !navigator.clipboard) return false;
        await navigator.clipboard.writeText(value);
      } catch {
        return false;
      }
      setIsCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setIsCopied(false), resetAfterMs);
      return true;
    },
    [resetAfterMs],
  );

  return { isCopied, copy };
}
