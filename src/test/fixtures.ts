import type { Post } from "@/features/posts";
import type { User } from "@/features/users";

function buildUser(overrides: Pick<User, "id" | "name" | "username" | "email"> & Partial<User>): User {
  return {
    phone: "1-770-736-8031 x56442",
    website: "example.org",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: { lat: "-37.3159", lng: "81.1496" },
    },
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
      bs: "harness real-time e-markets",
    },
    ...overrides,
  };
}

export const users: User[] = [
  buildUser({ id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" }),
  buildUser({
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: { lat: "-43.9509", lng: "-34.4618" },
    },
    company: { name: "Deckow-Crist", catchPhrase: "Proactive didactic contingency", bs: "synergize scalable" },
  }),
  buildUser({ id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net" }),
];

export const posts: Post[] = [
  { userId: 1, id: 1, title: "sunt aut facere repellat", body: "quia et suscipit\nsuscipit recusandae" },
  { userId: 1, id: 2, title: "qui est esse", body: "est rerum tempore vitae\nsequi sint nihil" },
  { userId: 2, id: 11, title: "et ea vero quia laudantium", body: "delectus reiciendis molestiae occaecati" },
];
