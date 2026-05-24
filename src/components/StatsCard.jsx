import { Card, CardContent } from "./ui/Card";

export function StatsCard({ label, value, icon: Icon, hint }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value ?? 0}</p>
          {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--accent)/0.1))] p-3 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
