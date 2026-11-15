"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine, Plus, Send } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { type CreatePostValues, createPostSchema, POST_BODY_MAX, POST_TITLE_MAX } from "../schemas";

const EMPTY_VALUES: CreatePostValues = { title: "", body: "" };

interface CreatePostDialogProps {
  authorName: string;
  /** Fire-and-forget: the caller handles the optimistic insert and its feedback. */
  onSubmit: (values: CreatePostValues) => void;
}

export function CreatePostDialog({ authorName, onSubmit }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();
  const titleId = `${fieldId}-title`;
  const bodyId = `${fieldId}-body`;

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
  });

  const title = useWatch({ control, name: "title" });
  const body = useWatch({ control, name: "body" });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    reset(EMPTY_VALUES);
    setOpen(false);
  });

  const submitWithShortcut = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="gap-2 px-3.5 shadow-sm max-sm:hidden" />}>
        <Plus aria-hidden />
        Nueva publicación
      </DialogTrigger>
      {/* Phones get a floating action button in the thumb zone instead of the inline trigger. */}
      <DialogTrigger
        render={
          <Button
            aria-label="Nueva publicación"
            className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 size-14 rounded-full shadow-xl shadow-foreground/20 duration-300 active:scale-95 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-75 sm:hidden"
          />
        }
      >
        <Plus aria-hidden className="size-6" />
      </DialogTrigger>
      <DialogContent className="gap-5 p-5 sm:max-w-lg">
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <PenLine className="size-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <DialogTitle>Nueva publicación</DialogTitle>
            <DialogDescription>Se publicará en el perfil de {authorName}.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={submit} onKeyDown={submitWithShortcut} className="grid gap-4">
          <FormField
            id={titleId}
            label="Título"
            error={errors.title?.message}
            counter={<CharacterCounter value={title} max={POST_TITLE_MAX} />}
          >
            <Input
              id={titleId}
              placeholder="Un título claro y directo"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? `${titleId}-error` : undefined}
              enterKeyHint="next"
              className="h-11 sm:h-10"
              onKeyDown={(event) => {
                // Enter moves on to the body instead of submitting a half-written post.
                if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
                  event.preventDefault();
                  setFocus("body");
                }
              }}
              {...register("title")}
            />
          </FormField>

          <FormField
            id={bodyId}
            label="Contenido"
            error={errors.body?.message}
            counter={<CharacterCounter value={body} max={POST_BODY_MAX} />}
          >
            <Textarea
              id={bodyId}
              rows={5}
              placeholder="¿Qué quieres contar?"
              aria-invalid={errors.body ? true : undefined}
              aria-describedby={errors.body ? `${bodyId}-error` : undefined}
              className="max-h-64 min-h-32 resize-none"
              {...register("body")}
            />
          </FormField>

          <DialogFooter className="-mx-5 -mb-5 items-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-between sm:pb-4">
            <p className="hidden text-xs text-muted-foreground sm:block">
              <kbd className="rounded border border-border bg-background px-1 font-mono">Ctrl</kbd> +{" "}
              <kbd className="rounded border border-border bg-background px-1 font-mono">Enter</kbd> para publicar
            </p>
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <DialogClose render={<Button type="button" variant="outline" size="lg" className="max-sm:h-11" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" size="lg" className="gap-2 max-sm:h-11">
                <Send aria-hidden />
                Publicar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  error: string | undefined;
  counter: ReactNode;
  children: ReactNode;
}

function FormField({ id, label, error, counter, children }: FormFieldProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Counts trimmed characters so the number always agrees with the validation rules. */
function CharacterCounter({ value, max }: { value: string; max: number }) {
  const length = value.trim().length;
  const isOverLimit = length > max;
  const isNearLimit = !isOverLimit && length >= max * 0.9;

  return (
    <span
      aria-hidden
      className={cn(
        "text-xs text-muted-foreground tabular-nums transition-colors",
        isNearLimit && "text-amber-600 dark:text-amber-400",
        isOverLimit && "font-medium text-destructive",
      )}
    >
      {length}/{max}
    </span>
  );
}
