import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Compass } from "lucide-react";
import PostCard from "../components/PostCard";
import UserListItem from "../components/UserListItem";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useDebounce } from "../hooks/useDebounce";
import { searchUsersRequest } from "../api/users";
import { getExploreRequest } from "../api/posts";

export default function Explore() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (pageNum) => {
    const { data } = await getExploreRequest(pageNum);
    setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
    setHasMore(data.hasMore);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(1).finally(() => setLoading(false));
  }, [loadPage]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      return;
    }
    setSearching(true);
    searchUsersRequest(debouncedQuery.trim())
      .then(({ data }) => setUsers(data.users))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  useEffect(() => {
    if (!hasMore || loading || query.trim()) return;
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
  }, [hasMore, loading, loadingMore, page, loadPage, query]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="card mb-4 flex items-center gap-2 px-4 py-3">
        <Search size={18} color="var(--color-ink-faint)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people on Bloom"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {query.trim() ? (
        <div className="card p-2">
          {searching ? (
            <LoadingSpinner className="py-10" size={24} />
          ) : users.length === 0 ? (
            <EmptyState title="No one found" message="Try a different name or username." />
          ) : (
            <div className="divide-y divide-[var(--color-border)] px-2">
              {users.map((u) => (
                <UserListItem key={u._id} user={u} />
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <LoadingSpinner className="py-16" size={32} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Compass size={24} />}
          title="Nothing to explore yet"
          message="Once people start posting, you'll see it all here."
        />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDeleted={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
          ))}
          <div ref={sentinelRef} />
          {loadingMore && <LoadingSpinner className="py-6" size={24} />}
        </>
      )}
    </div>
  );
}
