import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopHeader from "./TopHeader";
import CreatePostModal from "./CreatePostModal";
import { getNotificationsRequest } from "../api/notifications";
import { useSocket } from "../context/SocketContext";

export default function AppLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const { liveNotification } = useSocket();

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await getNotificationsRequest(1);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Non-critical - the badge just won't update
    }
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (liveNotification) setUnreadCount((c) => c + 1);
  }, [liveNotification]);

  useEffect(() => {
    const openComposer = () => setComposerOpen(true);
    window.addEventListener("bloom:open-composer", openComposer);
    return () => window.removeEventListener("bloom:open-composer", openComposer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar unreadCount={unreadCount} onCreateClick={() => setComposerOpen(true)} />

      <div className="flex-1 flex flex-col">
        <TopHeader />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet context={{ refreshUnread }} />
        </main>
      </div>

      <BottomNav unreadCount={unreadCount} onCreateClick={() => setComposerOpen(true)} />

      {composerOpen && (
        <CreatePostModal
          onClose={() => setComposerOpen(false)}
          onCreated={() => setComposerOpen(false)}
        />
      )}
    </div>
  );
}
