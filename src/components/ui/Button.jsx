import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary:
      "border border-primary/35 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-background shadow-lg shadow-primary/10 hover:brightness-110",
    secondary: "border border-border/80 bg-muted/55 text-foreground hover:bg-muted/85 hover:border-border",
    ghost: "text-card-foreground/80 hover:bg-muted/60 hover:text-foreground"
  };
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-tight transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
