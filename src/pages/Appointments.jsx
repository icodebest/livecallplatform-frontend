import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { appointmentsApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    appointmentsApi.list().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  async function updateStatus(id, status) {
    const updated = await appointmentsApi.patch(id, { status });
    setAppointments((items) => items.map((item) => (item.id === id ? updated : item)));
  }

  const filteredAppointments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const haystack = [
        appointment.patient_name,
        appointment.doctor_name,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.status
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [appointments, query, statusFilter]);

  return (
    <div className="page-shell">
      <PageHeader title="Appointment Management" description="Track upcoming, confirmed, rescheduled, and failed follow-ups." />
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Appointments</CardTitle>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search patient, doctor, status..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {["all", "scheduled", "confirmed", "rescheduled", "cancelled", "failed"].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{appointment.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{appointment.notes || "No notes"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-card-foreground/75">Dr. {appointment.doctor_name}</td>
                    <td className="px-4 py-3 text-sm text-card-foreground/75">{appointment.appointment_date} {appointment.appointment_time}</td>
                    <td className="px-4 py-3"><Badge tone={toneFor(appointment.status)}>{appointment.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" className="h-8 px-3" onClick={() => updateStatus(appointment.id, "confirmed")}>Confirm</Button>
                        <Button variant="secondary" className="h-8 px-3" onClick={() => updateStatus(appointment.id, "rescheduled")}>Reschedule</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && <tr><td className="px-4 py-8 text-sm text-muted-foreground" colSpan="5">No appointments matched.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function toneFor(status) {
  if (status === "confirmed") return "green";
  if (status === "rescheduled") return "amber";
  if (status === "failed" || status === "cancelled") return "red";
  return "slate";
}
