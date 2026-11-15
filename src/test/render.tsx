import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Renders `ui` with the same providers as the root layout and a ready-to-use user-event instance. */
export function renderWithProviders(ui: ReactElement) {
  const user = userEvent.setup();
  const view = render(
    <TooltipProvider>
      {ui}
      <Toaster />
    </TooltipProvider>,
  );
  return { user, ...view };
}
