import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sessionsApi } from "../api/client";
import { CallCard } from "../components/CallCard";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => setSessions([]));
  }, []);

  const filteredSessions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesSystem = systemFilter === "all" || session.system_type === systemFilter;
      const matchesOutcome = outcomeFilter === "all" || session.outcome === outcomeFilter;
      const haystack = [session.patient_name, session.doctor_name, session.outcome, session.system_type, session.preferred_language].join(" ").toLowerCase();
      return matchesSystem && matchesOutcome && (!needle || haystack.includes(needle));
    });
  }, [sessions, query, systemFilter, outcomeFilter]);

  return (
    <div className="page-shell">
      <PageHeader title="Session History" description="Review transcripts, summaries, outcomes, AI system selection, and latency." />
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Sessions</CardTitle>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search sessions..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <FilterSelect value={systemFilter} onChange={setSystemFilter} options={["all", "realtime", "modular"]} />
            <FilterSelect value={outcomeFilter} onChange={setOutcomeFilter} options={["all", "pending", "confirmed", "rescheduled", "failed", "escalated"]} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">AI System</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => <CallCard key={session.id} call={session} />)}
                {filteredSessions.length === 0 && <tr><td className="px-4 py-8 text-sm text-muted-foreground" colSpan="5">No sessions matched.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return <Select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</Select>;
}
