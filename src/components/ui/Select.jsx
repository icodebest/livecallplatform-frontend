import { cn } from "../../lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-11 rounded-2xl border border-border/80 bg-input/85 px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
