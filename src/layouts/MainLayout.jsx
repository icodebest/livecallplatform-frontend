import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="fixed inset-y-0 left-0 z-[60] hidden lg:block">
        <Navbar />
      </div>
      <main className="relative lg:pl-64">
        <div className="border-b border-border/70 bg-card/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-semibold tracking-tight">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" />
              Maya Health Voice
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground transition hover:bg-muted/70"
              onClick={() => setMobileSidebarOpen((current) => !current)}
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close navigation menu"
            />
            <div className="absolute inset-y-0 left-0 w-[88vw] max-w-xs shadow-2xl shadow-black/50">
              <Navbar
                className="h-full w-full rounded-r-3xl border-r border-border/70"
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
