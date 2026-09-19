import { Sidebar } from "@/components/dashboard/Sidebar";
import { Filters } from "@/components/dashboard/Filters";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

// Every page here is auth-gated and reads live query params server-side —
// there's nothing worth prerendering, and Sidebar/Filters' useSearchParams()
// requires this (or a Suspense boundary) to avoid the static-shell bailout.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-page-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border px-5">
          <Filters />
          <ThemeToggle />
        </header>
        <main className="min-w-0 flex-1 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
