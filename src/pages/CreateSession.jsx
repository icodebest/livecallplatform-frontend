import { CalendarClock, Check, Mic2, RotateCcw, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsApi, sessionsApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SystemSelector } from "../components/SystemSelector";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

const initialForm = {
  patient_name: "",
  doctor_name: "",
  appointment_date: "",
  appointment_time: "",
  notes: "",
  preferred_language: "auto",
  appointment_id: "",
  system_type: "realtime"
};

export function CreateSession() {
  const [form, setForm] = useState(initialForm);
  const [appointments, setAppointments] = useState([]);
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsApi.list().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = appointmentQuery.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const haystack = [appointment.patient_name, appointment.doctor_name, appointment.appointment_date, appointment.appointment_time, appointment.status].join(" ").toLowerCase();
      return !query || haystack.includes(query);
    });
  }, [appointments, appointmentQuery]);

  function selectAppointment(appointment) {
    setForm((current) => ({
      ...current,
      patient_name: appointment.patient_name || "",
      doctor_name: appointment.doctor_name || "",
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time || "",
      notes: appointment.notes || "",
      appointment_id: appointment.id || ""
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
          doctor_name: form.doctor_name,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          notes: form.notes
        });
        appointmentId = appointment.id;
      }
      const session = await sessionsApi.create({ ...form, appointment_id: appointmentId });
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to create session.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="Create AI Voice Session" description="Enter patient context, choose an AI architecture, then start a browser-native voice session." />
      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="self-start">
          <CardHeader><CardTitle>Appointment Context</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search patient, doctor, date..." value={appointmentQuery} onChange={(e) => setAppointmentQuery(e.target.value)} />
            </div>
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {filteredAppointments.map((appointment) => (
                <button key={appointment.id} type="button" onClick={() => selectAppointment(appointment)} className={`w-full rounded-2xl border p-3 text-left transition ${form.appointment_id === appointment.id ? "border-primary bg-primary/10" : "border-border bg-muted/45 hover:border-primary/50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{appointment.patient_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{appointment.status}</div>
                    </div>
                    {form.appointment_id === appointment.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-card-foreground/75">
                    <span className="inline-flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-primary" /> Dr. {appointment.doctor_name}</span>
                    <span className="inline-flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5 text-primary" /> {appointment.appointment_date} at {appointment.appointment_time}</span>
                  </div>
                </button>
              ))}
              {filteredAppointments.length === 0 && <div className="surface-muted p-4 text-sm text-muted-foreground">No saved appointments matched. You can enter session details manually.</div>}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_430px]">
          <Card>
            <CardHeader><CardTitle>Patient Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Patient Name"><Input required value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></Field>
              <Field label="Doctor Name"><Input required value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} /></Field>
              <Field label="Appointment Date"><Input required type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} /></Field>
              <Field label="Appointment Time"><Input required type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} /></Field>
              <Field label="Preferred Language"><Select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}>
                <option value="auto">Auto detect</option>
                <option value="english">English</option>
                <option value="urdu">Urdu</option>
                <option value="mixed">Mixed Urdu + English</option>
              </Select></Field>
              <Field label="Notes / Context" className="md:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              {error && <div className="md:col-span-2 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>AI System</CardTitle></CardHeader>
              <CardContent><SystemSelector value={form.system_type} onChange={(value) => setForm({ ...form, system_type: value })} /></CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1"><Mic2 className="h-4 w-4" /> {saving ? "Creating..." : "Start AI Session"}</Button>
              <Button type="button" variant="secondary" onClick={() => setForm(initialForm)}><RotateCcw className="h-4 w-4" /> Reset</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return <label className={`space-y-1.5 ${className}`}><span className="field-label">{label}</span>{children}</label>;
}
