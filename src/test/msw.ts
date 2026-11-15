import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { NewPost } from "@/features/posts";
import { API_BASE_URL } from "@/services/http-client";

import { posts, users } from "./fixtures";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

/** JSONPlaceholder answers every create with id 101; the mock mirrors that quirk. */
export const CREATED_POST_ID = 101;

export const handlers = [
  http.get(apiUrl("/users"), () => HttpResponse.json(users)),
  http.get(apiUrl("/posts"), ({ request }) => {
    const userId = Number(new URL(request.url).searchParams.get("userId"));
    return HttpResponse.json(posts.filter((post) => post.userId === userId));
  }),
  http.post<never, NewPost>(apiUrl("/posts"), async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...body, id: CREATED_POST_ID }, { status: 201 });
  }),
];

/** Network-level mock: tests exercise the real HTTP client, timeouts and schemas. */
export const server = setupServer(...handlers);
