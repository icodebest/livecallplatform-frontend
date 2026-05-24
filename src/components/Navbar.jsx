import { Activity, CalendarDays, History, PhoneCall } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/calls", label: "Calls", icon: History },
  { to: "/calls/new", label: "Create Call", icon: PhoneCall },
  { to: "/appointments", label: "Appointments", icon: CalendarDays }
];

export function Navbar({ className = "", onNavigate }) {
  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-border/70 bg-card/72 backdrop-blur-xl", className)}>
      <div className="border-b border-border/70 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-background shadow-lg shadow-primary/10">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-foreground">Maya Health Voice</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI appointment operations</div>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold tracking-tight text-card-foreground/78 transition duration-200 hover:-translate-y-0.5 hover:bg-muted/65 hover:text-foreground",
                isActive && "bg-[linear-gradient(135deg,hsl(var(--primary)/0.16),hsl(var(--accent)/0.08))] text-foreground ring-1 ring-primary/20"
              )
            }
          >
            <Icon className="h-4 w-4 transition group-hover:text-primary" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border/70 px-5 py-4">
        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-xs leading-5 text-muted-foreground">
          Realtime calls, transcripts, and appointment outcomes in one premium workspace.
        </div>
      </div>
    </aside>
  );
}
