import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't log you in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "linear-gradient(160deg, var(--color-pink-soft), var(--color-bg) 45%, var(--color-green-soft))" }}>
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="mb-1 text-center font-display text-xl font-semibold">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-[var(--color-ink-soft)]">Log in to see what's blooming.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="emailOrUsername" className="mb-1 block text-sm font-medium">
              Email or username
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              value={form.emailOrUsername}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-xl py-2.5 font-display font-semibold"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          New to Bloom?{" "}
          <Link to="/register" className="font-semibold text-[var(--color-purple-deep)]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
