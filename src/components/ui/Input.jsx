import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-border/80 bg-input/85 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-border/80 bg-input/85 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
      {...props}
    />
  );
}
