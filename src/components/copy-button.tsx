"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Accessible action, e.g. "Copiar email". */
  label: string;
  /** Toast shown on success, e.g. "Email copiado". */
  successMessage: string;
  className?: string;
}

export function CopyButton({ value, label, successMessage, className }: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const copied = await copy(value);
    if (copied) {
      toast.success(successMessage, { description: value });
    } else {
      toast.error("No se pudo copiar", { description: "El navegador bloqueó el acceso al portapapeles." });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            aria-label={isCopied ? `${successMessage}` : label}
            className={cn("rounded-full pointer-coarse:size-9", className)}
          />
        }
      >
        <span aria-hidden className="relative size-3.5">
          <Copy
            className={cn(
              "absolute inset-0 size-3.5 transition-all duration-200",
              isCopied ? "scale-50 opacity-0" : "scale-100 opacity-100",
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 size-3.5 text-success transition-all duration-200",
              isCopied ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>{isCopied ? "¡Copiado!" : label}</TooltipContent>
    </Tooltip>
  );
}
