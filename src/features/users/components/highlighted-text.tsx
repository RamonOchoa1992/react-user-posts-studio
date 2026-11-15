import { splitByMatch } from "@/lib/search";

interface HighlightedTextProps {
  text: string;
  query: string;
}

/**
 * Visual-only highlight: screen readers get the plain text, so names are not
 * fragmented or announced as "highlighted" on every keystroke.
 */
export function HighlightedText({ text, query }: HighlightedTextProps) {
  return (
    <>
      <span aria-hidden>
        {splitByMatch(text, query).map((segment, index) =>
          segment.isMatch ? (
            <mark key={index} className="rounded-[3px] bg-brand/15 text-foreground dark:bg-brand/30">
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
