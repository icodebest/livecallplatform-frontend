import { Activity, CalendarCheck, Clock3, PhoneCall, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi, callsApi } from "../api/client";
import { CallCard } from "../components/CallCard";
import { PageHeader } from "../components/PageHeader";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(() => setStats(null));
    callsApi.list().then(setCalls).catch(() => setCalls([]));
  }, []);

  const systemStats = stats?.systems || {
    realtime: { success_rate: 0, average_latency: 0, average_duration: 0 },
    modular: { success_rate: 0, average_latency: 0, average_duration: 0 }
  };

  return (
    <div className="page-shell">
      <PageHeader title="Operations Dashboard" description="Monitor appointment calls, AI performance, and outcomes." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Total Calls" value={stats?.total_calls} icon={PhoneCall} />
        <StatsCard label="Active Calls" value={stats?.active_calls} icon={Activity} />
        <StatsCard label="Confirmed" value={stats?.confirmed_appointments} icon={CalendarCheck} />
        <StatsCard label="Rescheduled" value={stats?.rescheduled_appointments} icon={Clock3} />
        <StatsCard label="Failed Calls" value={stats?.failed_calls} icon={TriangleAlert} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(systemStats).map(([system, data]) => (
          <Card key={system}>
            <CardHeader>
              <CardTitle>{system === "realtime" ? "Realtime API" : "Modular Pipeline"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Metric label="Success Rate" value={`${data.success_rate}%`} />
                <Metric label="Avg Latency" value={`${data.average_latency}ms`} />
                <Metric label="Avg Duration" value={`${data.average_duration}s`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
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
                {calls.slice(0, 6).map((call) => <CallCard key={call.id} call={call} />)}
                {calls.length === 0 && <tr><td className="px-4 py-8 text-sm text-muted-foreground" colSpan="5">No calls yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="surface-muted p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
