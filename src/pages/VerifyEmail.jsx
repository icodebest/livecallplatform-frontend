import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiErrorMessage, authApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthShell } from "./Login";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: params.get("email") || "", otp: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { applySession } = useAuth();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await authApi.verify(form);
      applySession(data);
      window.location.replace("/");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to verify email"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Verify email" subtitle="Enter the 6 digit code sent to your email. Your 4 hour demo starts after verification.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Verification code"><Input inputMode="numeric" maxLength={6} required value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} /></Field>
        {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <Button type="submit" disabled={saving} className="w-full"><ShieldCheck className="h-4 w-4" /> {saving ? "Verifying..." : "Verify and start demo"}</Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }) {
  return <label className="space-y-1.5"><span className="field-label">{label}</span>{children}</label>;
}
