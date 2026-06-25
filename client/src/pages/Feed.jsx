import { useCallback, useEffect, useRef, useState } from "react";
import { Sprout } from "lucide-react";
import PostCard from "../components/PostCard";
import SuggestionsPanel from "../components/SuggestionsPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { getFeedRequest } from "../api/posts";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (pageNum) => {
    const { data } = await getFeedRequest(pageNum);
    setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
    setHasMore(data.hasMore);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(1).finally(() => setLoading(false));
  }, [loadPage]);

  useEffect(() => {
    const onCreated = (e) => setPosts((prev) => [e.detail, ...prev]);
    window.addEventListener("bloom:post-created", onCreated);
    return () => window.removeEventListener("bloom:post-created", onCreated);
  }, []);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          loadPage(nextPage)
            .then(() => setPage(nextPage))
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, loadPage]);

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="flex">
      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <div className="card mb-4 flex items-center gap-3 p-4">
          <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("bloom:open-composer"))}
            className="flex-1 rounded-full bg-[var(--color-surface-soft)] px-4 py-2.5 text-left text-sm text-[var(--color-ink-faint)]"
          >
            What's blooming today?
          </button>
        </div>

        {loading ? (
          <LoadingSpinner className="py-16" size={32} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Sprout size={24} />}
            title="Your feed is quiet"
            message="Follow people on Explore to see their posts here, or share the first one yourself."
          />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
            ))}
            <div ref={sentinelRef} />
            {loadingMore && <LoadingSpinner className="py-6" size={24} />}
            {!hasMore && posts.length > 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">
                You're all caught up 🌱
              </p>
            )}
          </>
        )}
      </div>
      <SuggestionsPanel />
    </div>
  );
}
