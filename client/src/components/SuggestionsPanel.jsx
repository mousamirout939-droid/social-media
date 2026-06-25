import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import UserListItem from "./UserListItem";
import { getSuggestionsRequest } from "../api/users";

export default function SuggestionsPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestionsRequest()
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && users.length === 0) return null;

  return (
    <aside className="hidden xl:block w-80 shrink-0 px-4 py-6">
      <div className="card sticky top-6 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-purple-soft)", color: "var(--color-purple-deep)" }}
          >
            <Sparkles size={14} />
          </span>
          <h3 className="font-display font-semibold">Who to follow</h3>
        </div>
        {loading ? (
          <p className="py-4 text-center text-sm text-[var(--color-ink-faint)]">Finding people...</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {users.map((u) => (
              <UserListItem key={u._id} user={u} compact />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
