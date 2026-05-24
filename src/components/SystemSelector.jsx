import { RadioTower, Workflow } from "lucide-react";
import { cn } from "../lib/utils";

const systems = [
  {
    id: "realtime",
    title: "Realtime AI",
    description: "Ultra-low latency speech-to-speech calls with interruption handling.",
    icon: RadioTower
  },
  {
    id: "modular",
    title: "Modular Pipeline",
    description: "Observable STT, GPT, and TTS orchestration for analytics and control.",
    icon: Workflow
  }
];

export function SystemSelector({ value, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {systems.map((system) => {
        const Icon = system.icon;
        const active = value === system.id;
        return (
          <button
            key={system.id}
            type="button"
            onClick={() => onChange(system.id)}
            className={cn(
              "group rounded-3xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/50",
              active
                ? "border-primary/35 bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--accent)/0.08))] ring-2 ring-primary/20"
                : "border-border/80 bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("rounded-2xl p-2.5 transition", active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold tracking-tight text-foreground">{system.title}</div>
                <div className="mt-1 text-sm leading-5 text-muted-foreground">{system.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
