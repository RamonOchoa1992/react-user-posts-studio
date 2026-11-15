import { request } from "@/services/http-client";

import { usersResponseSchema } from "../schemas";
import type { User } from "../types";

export function getUsers(signal?: AbortSignal): Promise<User[]> {
  return request("/users", usersResponseSchema, { signal });
}
