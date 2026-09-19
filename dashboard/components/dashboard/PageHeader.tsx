import type { ReactNode } from "react";
import { SourceBadge } from "@/components/ui/Badge";

export function PageHeader({
  title,
  description,
  source,
  action,
}: {
  title: string;
  description?: string;
  source?: "mock" | "live";
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          {source ? <SourceBadge source={source} /> : null}
        </div>
        {description ? <p className="mt-1 max-w-2xl text-sm text-text-secondary">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
