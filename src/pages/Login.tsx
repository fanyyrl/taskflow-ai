import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email atau password salah.",
  "auth/email-already-in-use": "Email sudah terdaftar.",
  "auth/weak-password": "Password minimal 6 karakter.",
  "auth/invalid-email": "Format email tidak valid.",
};

export default function Login() {
  const { user, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await (isRegister ? register(email, password) : login(email, password));
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(MESSAGES[code] ?? "Terjadi kesalahan. Coba lagi.");
    }
    setBusy(false);
  };

  return (
    <div className="login">
      <div className="card login-card">
        <h1>TaskFlow AI</h1>
        <p className="sub">Smart Task &amp; Time Management untuk mahasiswa</p>
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>
            {isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>
        <button className="link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
        </button>
      </div>
    </div>
  );
}
