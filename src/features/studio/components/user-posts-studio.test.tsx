import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { NewPost } from "@/features/posts";
import { posts, users } from "@/test/fixtures";
import { apiUrl, CREATED_POST_ID, server } from "@/test/msw";
import { renderWithProviders } from "@/test/render";

import { UserPostsStudio } from "./user-posts-studio";

const userCard = (name: RegExp) => screen.getByRole("button", { name });
const findUserCard = (name: RegExp) => screen.findByRole("button", { name });
const searchBox = () => screen.getByRole("searchbox", { name: /buscar usuarios/i });
const feed = (authorName: string) => screen.getByRole("list", { name: `Publicaciones de ${authorName}` });

/** jsdom ignores CSS, so both triggers exist (inline + phone FAB); they open the same dialog. */
const openComposer = async (user: ReturnType<typeof renderWithProviders>["user"]) => {
  const [inlineTrigger] = screen.getAllByRole("button", { name: /nueva publicación/i });
  if (!inlineTrigger) throw new Error("Composer trigger not rendered");
  await user.click(inlineTrigger);
  return screen.findByRole("dialog", { name: /nueva publicación/i });
};

describe("UserPostsStudio", () => {
  describe("users panel", () => {
    it("lists every user and filters them by name, case-insensitively", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);

      for (const { name } of users) expect(await findUserCard(new RegExp(name))).toBeInTheDocument();
      expect(screen.getByText(`${users.length} usuarios`)).toBeInTheDocument();

      await user.type(searchBox(), "ERVIN");

      expect(userCard(/Ervin Howell/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Leanne Graham/ })).not.toBeInTheDocument();
      expect(screen.getByText(`1 de ${users.length}`)).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(searchBox()).toHaveValue("");
      expect(userCard(/Leanne Graham/)).toBeInTheDocument();
    });

    it("shows an empty state without matches and restores the list when the query is cleared", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);
      await findUserCard(/Leanne Graham/);

      await user.type(searchBox(), "zzz");
      expect(screen.getByText("Sin coincidencias")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /ver todos los usuarios/i }));

      expect(searchBox()).toHaveValue("");
      expect(screen.queryByText("Sin coincidencias")).not.toBeInTheDocument();
      expect(userCard(/Leanne Graham/)).toBeInTheDocument();
    });

    it("renders skeletons while loading, an error state on failure, and recovers on retry", async () => {
      server.use(http.get(apiUrl("/users"), () => HttpResponse.json(null, { status: 503 }), { once: true }));
      const { user } = renderWithProviders(<UserPostsStudio />);

      expect(screen.getByRole("status", { name: /cargando usuarios/i })).toBeInTheDocument();

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("No pudimos cargar los usuarios");
      expect(alert).toHaveTextContent("503");

      await user.click(within(alert).getByRole("button", { name: /reintentar/i }));

      expect(await findUserCard(/Leanne Graham/)).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("simulates a network failure on demand and recovers with a real retry", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);
      await findUserCard(/Leanne Graham/);

      await user.click(screen.getByRole("button", { name: /simular error de red/i }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/fallo de red simulado/i);

      await user.click(within(alert).getByRole("button", { name: /reintentar/i }));
      expect(await findUserCard(/Leanne Graham/)).toBeInTheDocument();
    });
  });

  describe("user detail", () => {
    it("shows the selected user's profile and posts, and reflects the selection in the URL", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);

      await user.click(await findUserCard(/Leanne Graham/));

      expect(screen.getByRole("heading", { level: 2, name: "Leanne Graham" })).toBeInTheDocument();
      expect(userCard(/Leanne Graham/)).toHaveAttribute("aria-current", "true");
      expect(window.location.search).toBe("?user=1");

      const leannePosts = posts.filter((post) => post.userId === 1);
      const list = await screen.findByRole("list", { name: "Publicaciones de Leanne Graham" });
      expect(within(list).getAllByRole("article")).toHaveLength(leannePosts.length);
      for (const post of leannePosts) expect(within(list).getByText(post.title)).toBeInTheDocument();
    });

    it("opens a deep-linked profile straight from the URL", async () => {
      window.history.replaceState(null, "", "/?user=2");
      renderWithProviders(<UserPostsStudio />);

      expect(await screen.findByRole("heading", { level: 2, name: "Ervin Howell" })).toBeInTheDocument();
      expect(await screen.findByText(posts.find((post) => post.userId === 2)?.title ?? "")).toBeInTheDocument();
    });

    it("returns to the list from the mobile back button", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);
      await user.click(await findUserCard(/Leanne Graham/));

      await user.click(screen.getByRole("button", { name: /volver/i }));

      expect(window.location.search).toBe("");
      expect(screen.queryByRole("heading", { level: 2, name: "Leanne Graham" })).not.toBeInTheDocument();
      expect(screen.getByText("Selecciona un usuario")).toBeInTheDocument();
    });
  });

  describe("post creation", () => {
    it("blocks submission and explains every invalid field", async () => {
      const { user } = renderWithProviders(<UserPostsStudio />);
      await user.click(await findUserCard(/Leanne Graham/));
      const dialog = await openComposer(user);

      await user.click(within(dialog).getByRole("button", { name: /^publicar$/i }));

      expect(await within(dialog).findByText("El título es obligatorio.")).toBeInTheDocument();
      expect(within(dialog).getByText("El contenido es obligatorio.")).toBeInTheDocument();
      expect(within(dialog).getByLabelText("Título")).toHaveAttribute("aria-invalid", "true");

      await user.type(within(dialog).getByLabelText("Título"), "Hi");
      await user.type(within(dialog).getByLabelText("Contenido"), "Corto");
      await user.click(within(dialog).getByRole("button", { name: /^publicar$/i }));

      expect(await within(dialog).findByText(/al menos 3 caracteres/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    });

    it("publishes optimistically: the new post lands first, flagged as new, and survives profile switches", async () => {
      let receivedBody: NewPost | undefined;
      server.use(
        http.post<never, NewPost>(apiUrl("/posts"), async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...receivedBody, id: CREATED_POST_ID }, { status: 201 });
        }),
      );
      const { user } = renderWithProviders(<UserPostsStudio />);
      await user.click(await findUserCard(/Leanne Graham/));
      await screen.findByRole("list", { name: "Publicaciones de Leanne Graham" });

      const dialog = await openComposer(user);
      await user.type(within(dialog).getByLabelText("Título"), "  Mi nueva publicación  ");
      await user.type(within(dialog).getByLabelText("Contenido"), "Un contenido con suficiente longitud.");
      await user.click(within(dialog).getByRole("button", { name: /^publicar$/i }));

      const [firstPost] = within(feed("Leanne Graham")).getAllByRole("article");
      expect(firstPost).toHaveTextContent("Mi nueva publicación");
      expect(firstPost).toHaveTextContent("Nuevo");
      expect(await screen.findByText("Publicado en el perfil de Leanne")).toBeInTheDocument();
      expect(receivedBody).toEqual({
        userId: 1,
        title: "Mi nueva publicación",
        body: "Un contenido con suficiente longitud.",
      });

      await user.click(userCard(/Ervin Howell/));
      await screen.findByRole("list", { name: "Publicaciones de Ervin Howell" });
      await user.click(userCard(/Leanne Graham/));

      const [stillFirst] = within(
        await screen.findByRole("list", { name: "Publicaciones de Leanne Graham" }),
      ).getAllByRole("article");
      expect(stillFirst).toHaveTextContent("Mi nueva publicación");
    });

    it("rolls the optimistic post back and reports the error when the API rejects it", async () => {
      server.use(http.post(apiUrl("/posts"), () => HttpResponse.json(null, { status: 500 })));
      const { user } = renderWithProviders(<UserPostsStudio />);
      await user.click(await findUserCard(/Leanne Graham/));
      await screen.findByRole("list", { name: "Publicaciones de Leanne Graham" });

      const dialog = await openComposer(user);
      await user.type(within(dialog).getByLabelText("Título"), "Publicación fallida");
      await user.type(within(dialog).getByLabelText("Contenido"), "Este contenido nunca llegará al servidor.");
      await user.click(within(dialog).getByRole("button", { name: /^publicar$/i }));

      expect(await screen.findByText(/el servidor tuvo un problema \(500\)/i)).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByText("Publicación fallida")).not.toBeInTheDocument());
    });
  });
});
