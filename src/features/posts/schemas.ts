import { z } from "zod";

import type { Post } from "./types";

export const POST_TITLE_MIN = 3;
export const POST_TITLE_MAX = 100;
export const POST_BODY_MIN = 10;
export const POST_BODY_MAX = 500;

/**
 * Form schema. Lengths are measured after trimming so whitespace-only input can
 * never satisfy the minimum and trailing spaces never push a text over the max.
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .min(POST_TITLE_MIN, `El título debe tener al menos ${POST_TITLE_MIN} caracteres.`)
    .max(POST_TITLE_MAX, `El título no puede superar los ${POST_TITLE_MAX} caracteres.`),
  body: z
    .string()
    .trim()
    .min(1, "El contenido es obligatorio.")
    .min(POST_BODY_MIN, `El contenido debe tener al menos ${POST_BODY_MIN} caracteres.`)
    .max(POST_BODY_MAX, `El contenido no puede superar los ${POST_BODY_MAX} caracteres.`),
});

export type CreatePostValues = z.infer<typeof createPostSchema>;

/** Runtime guard for the JSONPlaceholder `/posts` contract. */
export const postResponseSchema: z.ZodType<Post> = z.object({
  userId: z.number().int().positive(),
  id: z.number().int().positive(),
  title: z.string(),
  body: z.string(),
});

export const postsResponseSchema = z.array(postResponseSchema);
