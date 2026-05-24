import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { callsApi } from "../api/client";
import { CallCard } from "../components/CallCard";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export function Calls() {
  const [calls, setCalls] = useState([]);
  const [query, setQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  useEffect(() => {
    callsApi.list().then(setCalls).catch(() => setCalls([]));
  }, []);

  const filteredCalls = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return calls.filter((call) => {
      const matchesSystem = systemFilter === "all" || call.system_type === systemFilter;
      const matchesOutcome = outcomeFilter === "all" || call.outcome === outcomeFilter;
      const haystack = [call.patient_name, call.phone_number, call.doctor_name, call.outcome, call.system_type].join(" ").toLowerCase();
      return matchesSystem && matchesOutcome && (!needle || haystack.includes(needle));
    });
  }, [calls, query, systemFilter, outcomeFilter]);

  return (
    <div className="page-shell">
      <PageHeader title="Call History" description="Review transcripts, summaries, latency, and appointment outcomes." />
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Calls</CardTitle>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search calls..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <FilterSelect value={systemFilter} onChange={setSystemFilter} options={["all", "realtime", "modular"]} />
            <FilterSelect value={outcomeFilter} onChange={setOutcomeFilter} options={["all", "pending", "confirmed", "rescheduled", "failed"]} />
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
                {filteredCalls.map((call) => <CallCard key={call.id} call={call} />)}
                {filteredCalls.length === 0 && <tr><td className="px-4 py-8 text-sm text-muted-foreground" colSpan="5">No calls matched.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </Select>
  );
}
