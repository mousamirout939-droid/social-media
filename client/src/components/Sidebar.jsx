import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Bell, Bookmark, User, PlusCircle, LogOut } from "lucide-react";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

// Each primary nav item is framed in a soft chip that rotates through the
// three brand tones, so the sidebar itself reads as the trio identity.
const CHIP = {
  pink: { bg: "var(--color-pink-soft)", active: "var(--color-pink)", fg: "var(--color-pink-deep)" },
  green: { bg: "var(--color-green-soft)", active: "var(--color-green)", fg: "var(--color-green-deep)" },
  purple: { bg: "var(--color-purple-soft)", active: "var(--color-purple)", fg: "var(--color-purple-deep)" },
};

function NavItem({ to, icon, label, tone, badge, onClick }) {
  const colors = CHIP[tone];
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-chip relative flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium text-[var(--color-ink)] ${
          isActive ? "shadow-[var(--shadow-soft)]" : ""
        }`
      }
      style={({ isActive }) => ({ backgroundColor: isActive ? colors.active : "transparent" })}
    >
      {({ isActive }) => (
        <>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: isActive ? colors.active : colors.bg, color: colors.fg }}
          >
            {icon}
          </span>
          <span className="hidden lg:inline">{label}</span>
          {badge > 0 && (
            <span
              className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold text-white lg:flex"
              style={{ backgroundColor: "var(--color-danger)" }}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ unreadCount = 0, onCreateClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex md:w-20 lg:w-64 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-6 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        <div className="px-2">
          <Logo />
        </div>

        <nav className="flex flex-col gap-1.5">
          <NavItem to="/" icon={<Home size={20} />} label="Home" tone="purple" />
          <NavItem to="/explore" icon={<Compass size={20} />} label="Explore" tone="green" />
          <NavItem
            to="/notifications"
            icon={<Bell size={20} />}
            label="Notifications"
            tone="pink"
            badge={unreadCount}
          />
          <NavItem to="/saved" icon={<Bookmark size={20} />} label="Saved" tone="purple" />
          <NavItem to={`/profile/${user?.username}`} icon={<User size={20} />} label="Profile" tone="green" />
        </nav>

        <button
          onClick={onCreateClick}
          className="btn-primary flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 font-display font-medium"
        >
          <PlusCircle size={20} />
          <span className="hidden lg:inline">Create post</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="nav-chip flex items-center gap-3 rounded-2xl px-3 py-2.5 font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-soft)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)]">
            <LogOut size={20} />
          </span>
          <span className="hidden lg:inline">Log out</span>
        </button>

        <NavLink
          to={`/profile/${user?.username}`}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-[var(--color-surface-soft)]"
        >
          <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          <div className="hidden lg:block overflow-hidden">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-[var(--color-ink-soft)]">@{user?.username}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
