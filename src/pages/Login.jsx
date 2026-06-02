import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { applySession } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await authApi.login(form);
      applySession(data);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Unable to login");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Login to continue your verified demo workspace.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><PasswordInput required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <div className="text-right">
          <Link className="text-sm text-primary hover:text-primary/80" to="/forgot-password">Forgot password?</Link>
        </div>
        {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        <Button type="submit" disabled={saving} className="w-full"><LogIn className="h-4 w-4" /> {saving ? "Signing in..." : "Login"}</Button>
        <p className="text-center text-sm text-muted-foreground">New here? <Link className="text-primary" to="/signup">Create account</Link></p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="space-y-1.5"><span className="field-label">{label}</span>{children}</label>;
}
