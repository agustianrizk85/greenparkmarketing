import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/** Login screen — shared Greenpark executive style (navy/green). */
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("kadep@greenpark.id");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="login-logo">GP</div>
          <div>
            <h1>Alur Kerja Marketing</h1>
            <p>Greenpark Group · Departemen Marketing</p>
          </div>
        </div>

        <label className="login-field">
          <span>Email</span>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kadep@greenpark.id"
            autoComplete="username"
          />
        </label>
        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button className="login-btn" type="submit" disabled={busy || !email || !password}>
          {busy ? "Memproses…" : "Masuk"}
        </button>

        <div className="login-hint">
          Kadep: <b>kadep@greenpark.id / kadep123</b> · Tim: <b>design@</b>, <b>copywriter@</b>,{" "}
          <b>editor@</b>, <b>sosmed@</b>, <b>digital@</b> (staff123) · Lapangan: <b>talent@</b>,{" "}
          <b>videografer@</b>
        </div>
      </form>
    </div>
  );
}
