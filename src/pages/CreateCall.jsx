import { CalendarClock, Check, PhoneCall, RotateCcw, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callsApi, appointmentsApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SystemSelector } from "../components/SystemSelector";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";

const initialForm = {
  patient_name: "",
  phone_number: "",
  doctor_name: "",
  appointment_date: "",
  appointment_time: "",
  notes: "",
  appointment_id: "",
  system_type: "realtime"
};

export function CreateCall() {
  const [form, setForm] = useState(initialForm);
  const [appointments, setAppointments] = useState([]);
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    appointmentsApi
      .list()
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppointments(false));
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = appointmentQuery.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const haystack = [
        appointment.patient_name,
        appointment.phone_number,
        appointment.doctor_name,
        appointment.appointment_date,
        appointment.appointment_time
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [appointments, appointmentQuery, statusFilter]);

  function selectAppointment(appointment) {
    setForm((current) => ({
      ...current,
      patient_name: appointment.patient_name || "",
      phone_number: appointment.phone_number || "",
      doctor_name: appointment.doctor_name || "",
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time || "",
      notes: appointment.notes || "",
      appointment_id: appointment.id || ""
    }));
  }

  function clearAppointmentSelection() {
    setForm((current) => ({
      ...initialForm,
      system_type: current.system_type
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      let appointmentId = form.appointment_id;
      if (!appointmentId) {
        const appointment = await appointmentsApi.create({
          patient_name: form.patient_name,
          phone_number: form.phone_number,
          doctor_name: form.doctor_name,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          notes: form.notes
        });
        appointmentId = appointment.id;
      }
      const call = await callsApi.create({ ...form, appointment_id: appointmentId });
      navigate(`/calls/${call.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to start call. Check backend configuration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="Create Outbound Call" description="Select an appointment from MongoDB, review details, then start the AI reminder call." />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Find Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search patient, phone, doctor..."
                value={appointmentQuery}
                onChange={(event) => setAppointmentQuery(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["all", "scheduled", "confirmed"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium capitalize transition ${
                    statusFilter === status ? "filter-pill filter-pill-active" : "filter-pill"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {loadingAppointments && <p className="text-sm text-muted-foreground">Loading appointments...</p>}
              {!loadingAppointments && filteredAppointments.length === 0 && (
                <div className="surface-muted p-4 text-sm text-muted-foreground">
                  No appointment matched. You can still enter details manually.
                </div>
              )}
              {filteredAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => selectAppointment(appointment)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    form.appointment_id === appointment.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/45 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{appointment.patient_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{appointment.phone_number}</div>
                    </div>
                    {form.appointment_id === appointment.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-card-foreground/75">
                    <span className="inline-flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-primary" /> Dr. {appointment.doctor_name}</span>
                    <span className="inline-flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5 text-primary" /> {appointment.appointment_date} at {appointment.appointment_time}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader>
              <CardTitle>Patient and Appointment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {form.appointment_id && (
                <div className="md:col-span-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                  Using appointment from database. You can edit the fields before starting the call.
                </div>
              )}
              <Field label="Patient Name"><Input required value={form.patient_name} onChange={(e) => update("patient_name", e.target.value)} /></Field>
              <Field label="Phone Number"><Input required placeholder="+15555550100" value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} /></Field>
              <Field label="Doctor Name"><Input required value={form.doctor_name} onChange={(e) => update("doctor_name", e.target.value)} /></Field>
              <Field label="Appointment Date"><Input required type="date" value={form.appointment_date} onChange={(e) => update("appointment_date", e.target.value)} /></Field>
              <Field label="Appointment Time"><Input required type="time" value={form.appointment_time} onChange={(e) => update("appointment_time", e.target.value)} /></Field>
              <Field label="Notes / Context" className="md:col-span-2"><Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
              {error && <div className="md:col-span-2 rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI System</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemSelector value={form.system_type} onChange={(value) => update("system_type", value)} />
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                <PhoneCall className="h-4 w-4" /> {saving ? "Starting..." : "Start Call"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearAppointmentSelection}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
