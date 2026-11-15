"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Theme = "light" | "dark";

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Theme switch with a circular reveal from the button (View Transitions API).
 * The class is applied synchronously inside the transition callback so the
 * "new" snapshot is captured with the next theme; next-themes then persists it.
 * Degrades to an instant switch when unsupported or with reduced motion.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof document.startViewTransition !== "function" || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      applyThemeClass(nextTheme);
      setTheme(nextTheme);
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {
        // The transition was skipped (e.g. tab hidden); the theme is already applied.
      });
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-label="Cambiar entre tema claro y oscuro"
            className="relative pointer-coarse:size-10"
          />
        }
      >
        <Sun
          aria-hidden
          className="scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90"
        />
        <Moon
          aria-hidden
          className="absolute scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0"
        />
      </TooltipTrigger>
      <TooltipContent>Cambiar tema</TooltipContent>
    </Tooltip>
  );
}
