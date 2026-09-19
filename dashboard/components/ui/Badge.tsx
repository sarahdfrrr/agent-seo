import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "good" | "warning" | "accent";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-secondary border-border",
  good: "bg-status-good/10 text-status-good border-status-good/25",
  warning: "bg-status-warning/10 text-[color:var(--status-warning)] border-status-warning/25",
  accent: "bg-accent-soft text-accent border-accent/25",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-relaxed",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SourceBadge({ source }: { source: "mock" | "live" }) {
  return (
    <Badge tone={source === "live" ? "good" : "neutral"}>
      <span className={cn("h-1.5 w-1.5 rounded-full", source === "live" ? "bg-status-good" : "bg-text-muted")} />
      {source === "live" ? "données live" : "données de démo"}
    </Badge>
  );
}
