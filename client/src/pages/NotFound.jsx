import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo size="lg" />
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--color-ink-soft)]">
        Whatever you were looking for didn't take root here.
      </p>
      <Link to="/" className="btn-primary rounded-full px-5 py-2.5 font-display font-semibold">
        Back to your feed
      </Link>
    </div>
  );
}
