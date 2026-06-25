import { NavLink } from "react-router-dom";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { to: "/", icon: Home, tone: "var(--color-purple-deep)", label: "Home" },
  { to: "/explore", icon: Compass, tone: "var(--color-green-deep)", label: "Explore" },
];

export default function BottomNav({ unreadCount = 0, onCreateClick }) {
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 [padding-bottom:env(safe-area-inset-bottom)]">
      {TABS.map(({ to, icon: Icon, tone, label }) => (
        <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1" aria-label={label}>
          {({ isActive }) => <Icon size={22} color={isActive ? tone : "var(--color-ink-faint)"} />}
        </NavLink>
      ))}

      <button
        onClick={onCreateClick}
        aria-label="Create post"
        className="btn-primary -mt-6 flex h-12 w-12 items-center justify-center rounded-full shadow-[var(--shadow-bloom)]"
      >
        <PlusCircle size={24} />
      </button>

      <NavLink to="/notifications" className="relative flex flex-col items-center gap-0.5 px-3 py-1" aria-label="Notifications">
        {({ isActive }) => (
          <>
            <Bell size={22} color={isActive ? "var(--color-pink-deep)" : "var(--color-ink-faint)"} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 right-1 h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold text-white flex items-center justify-center"
                style={{ backgroundColor: "var(--color-danger)" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </NavLink>

      <NavLink to={`/profile/${user?.username}`} className="flex flex-col items-center gap-0.5 px-3 py-1" aria-label="Profile">
        {({ isActive }) => <User size={22} color={isActive ? "var(--color-green-deep)" : "var(--color-ink-faint)"} />}
      </NavLink>
    </nav>
  );
}
