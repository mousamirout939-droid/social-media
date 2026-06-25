import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { toggleFollowRequest } from "../api/users";

export default function UserListItem({ user: target, initialFollowing = false, compact = false }) {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (!target || target._id === currentUser?._id) return null;

  const handleToggle = async () => {
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollowRequest(target._id);
    } catch {
      setFollowing(!next);
      toast.error("Couldn't update follow status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <Link to={`/profile/${target.username}`}>
        <Avatar src={target.avatar?.url} name={target.name} size={compact ? "sm" : "md"} />
      </Link>
      <Link to={`/profile/${target.username}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{target.name}</p>
        <p className="truncate text-xs text-[var(--color-ink-faint)]">@{target.username}</p>
        {!compact && target.bio && (
          <p className="truncate text-xs text-[var(--color-ink-soft)]">{target.bio}</p>
        )}
      </Link>
      <button
        onClick={handleToggle}
        disabled={busy}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
          following ? "bg-[var(--color-surface-soft)] text-[var(--color-ink-soft)]" : "btn-primary"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
