import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <section className={cn("rounded-3xl border border-border/70 bg-card/72 text-card-foreground shadow-panel backdrop-blur-xl", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("border-b border-border/70 px-6 py-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-base font-semibold tracking-tight text-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}
