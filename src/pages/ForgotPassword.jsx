import { Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthShell } from "./Login";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await authApi.forgotPassword({ email });
      setMessage(data.message || "Password reset code sent.");
      window.setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 600);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to send reset code");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Forgot password" subtitle="Enter your email and we will send a reset verification code.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        {message && <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">{message}</div>}
        {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <Button type="submit" disabled={saving} className="w-full"><Mail className="h-4 w-4" /> {saving ? "Sending..." : "Send reset code"}</Button>
        <p className="text-center text-sm text-muted-foreground"><Link className="text-primary" to="/login">Back to login</Link></p>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }) {
  return <label className="space-y-1.5"><span className="field-label">{label}</span>{children}</label>;
}
