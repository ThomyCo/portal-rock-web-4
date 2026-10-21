import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, safeNext } from "./authApi";
export function LoginPage() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    navigate = useNavigate(),
    [params] = useSearchParams();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("Ingresando…");
    try {
      await login(email, password);
      navigate(safeNext(params.get("next")));
    } catch (error) {
      setMessage((error as Error).message);
    }
  }
  return (
    <main className="form-page">
      <div className="form-card">
        <p className="eyebrow">TU CUENTA</p>
        <h1>Iniciar sesión</h1>
        <form onSubmit={submit}>
          <label>
            Correo
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button button-primary">Ingresar</button>
          <p role="status">{message}</p>
        </form>
        <p>
          <Link to="/registro">Crear cuenta</Link> ·{" "}
          <Link to="/recuperar">Recuperar contraseña</Link>
        </p>
      </div>
    </main>
  );
}
