import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { AuthShell } from "./Login";

export function ResetPassword() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: params.get("email") || "", otp: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authApi.resetPassword(form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to reset password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter the reset code from your email and choose a new password.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Reset code"><Input inputMode="numeric" maxLength={6} required value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} /></Field>
        <Field label="New password"><PasswordInput minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <Button type="submit" disabled={saving} className="w-full"><KeyRound className="h-4 w-4" /> {saving ? "Resetting..." : "Reset password"}</Button>
        <p className="text-center text-sm text-muted-foreground"><Link className="text-primary" to="/login">Back to login</Link></p>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }) {
  return <label className="space-y-1.5"><span className="field-label">{label}</span>{children}</label>;
}
