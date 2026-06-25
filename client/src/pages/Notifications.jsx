import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import NotificationItem from "../components/NotificationItem";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getNotificationsRequest, markAllReadRequest } from "../api/notifications";

export default function Notifications() {
  const { refreshUnread } = useOutletContext() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationsRequest()
      .then(({ data }) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await markAllReadRequest();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshUnread?.();
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-purple-deep)] hover:bg-[var(--color-purple-soft)]"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="card p-2">
        {loading ? (
          <LoadingSpinner className="py-16" size={28} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={22} />}
            title="No notifications yet"
            message="Likes, comments, and new followers will show up here."
          />
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((n) => (
              <NotificationItem key={n._id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
