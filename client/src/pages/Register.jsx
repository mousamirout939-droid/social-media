import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ ...form, username: form.username.toLowerCase() });
      toast.success("Welcome to Bloom!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create your account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, var(--color-purple-soft), var(--color-bg) 45%, var(--color-pink-soft))" }}
    >
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="mb-1 text-center font-display text-xl font-semibold">Join Bloom</h1>
        <p className="mb-6 text-center text-sm text-[var(--color-ink-soft)]">
          Share moments, follow people you like.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={50}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={25}
              pattern="[a-zA-Z0-9_.]+"
              title="Letters, numbers, underscores and dots only"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-xl py-2.5 font-display font-semibold"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          Already on Bloom?{" "}
          <Link to="/login" className="font-semibold text-[var(--color-purple-deep)]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
