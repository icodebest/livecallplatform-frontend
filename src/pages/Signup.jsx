import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { AuthShell } from "./Login";

export function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authApi.signup(form);
      navigate(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Create demo account" subtitle="Verify your email to activate 4 hours of demo access.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><PasswordInput minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <Button type="submit" disabled={saving} className="w-full"><UserPlus className="h-4 w-4" /> {saving ? "Creating..." : "Signup"}</Button>
        <p className="text-center text-sm text-muted-foreground">Already verified? <Link className="text-primary" to="/login">Login</Link></p>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }) {
  return <label className="space-y-1.5"><span className="field-label">{label}</span>{children}</label>;
}
