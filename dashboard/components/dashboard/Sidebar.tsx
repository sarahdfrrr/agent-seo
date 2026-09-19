"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, LineChart, Search, Megaphone, Mail, Share2, LogOut } from "lucide-react";
import { CHANNELS } from "@/lib/data/channels";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils/cn";

const ICONS = {
  ga4: LineChart,
  seo: Search,
  ads: Megaphone,
  email: Mail,
  social: Share2,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  const navItems = [
    { route: "/", label: "Vue d'ensemble", Icon: LayoutDashboard },
    ...CHANNELS.map((c) => ({ route: c.route, label: c.shortLabel, Icon: ICONS[c.id] })),
  ];

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-surface-1">
      <div className="flex items-center gap-2 px-4 py-4 font-mono text-sm text-text-primary">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        pulse
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ route, label, Icon }) => {
          const active = route === "/" ? pathname === "/" : pathname.startsWith(route);
          return (
            <Link
              key={route}
              href={`${route}${suffix}`}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-accent-soft text-text-primary"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
              )}
            >
              <Icon size={15} strokeWidth={2} className={active ? "text-accent" : "text-text-muted"} />
              <span className="font-mono">{label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="border-t border-border px-2 py-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-mono text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <LogOut size={15} strokeWidth={2} className="text-text-muted" />
          déconnexion
        </button>
      </form>
    </aside>
  );
}
