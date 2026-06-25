import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Logo from "./Logo";

export default function TopHeader() {
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur px-4 py-3">
      <Logo size="sm" />
      <button
        onClick={() => navigate("/explore")}
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-[var(--color-ink-soft)]"
      >
        <Search size={18} />
      </button>
    </header>
  );
}
