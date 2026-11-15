/** Public API of the users feature. Import from "@/features/users" only. */
export { UserAvatar } from "./components/user-avatar";
export { UserProfile } from "./components/user-profile";
export { UsersPanel } from "./components/users-panel";
export { useUsers, type UseUsersResult } from "./hooks/use-users";
export type { Address, Company, Geo, User } from "./types";
