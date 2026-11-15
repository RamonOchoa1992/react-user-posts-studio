"use client";

import { Search, X } from "lucide-react";
import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { useFocusShortcut } from "@/hooks/use-focus-shortcut";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusShortcut(inputRef);

  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder="Buscar por nombre…"
        aria-label="Buscar usuarios por nombre"
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
        className="h-10 rounded-xl bg-card pr-10 pl-9 shadow-xs dark:bg-card pointer-coarse:h-11 pointer-coarse:pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-75 pointer-coarse:right-1 pointer-coarse:size-9"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 hidden h-5 -translate-y-1/2 items-center rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex"
        >
          /
        </kbd>
      )}
    </div>
  );
}
