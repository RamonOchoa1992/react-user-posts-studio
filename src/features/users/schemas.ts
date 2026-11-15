import { z } from "zod";

import type { User } from "./types";

/**
 * Runtime guard for the JSONPlaceholder `/users` contract. Annotated with the
 * domain interface so the compiler keeps the schema and the type in sync.
 */
export const userSchema: z.ZodType<User> = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
    geo: z.object({ lat: z.string(), lng: z.string() }),
  }),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export const usersResponseSchema = z.array(userSchema);
