import { AppHeader } from "@/components/layout/app-header";

export default function HomePage() {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />
      <main className="flex-1" />
    </div>
  );
}
