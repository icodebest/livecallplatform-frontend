import { cn } from "../../lib/utils";

export function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "border-success/25 bg-success/12 text-success",
    red: "border-danger/25 bg-danger/12 text-danger",
    amber: "border-warning/25 bg-warning/12 text-warning",
    blue: "border-primary/25 bg-primary/12 text-primary",
    purple: "border-accent/25 bg-accent/12 text-accent",
    slate: "border-border/80 bg-muted/70 text-muted-foreground"
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]", tones[tone])}>{children}</span>;
}
