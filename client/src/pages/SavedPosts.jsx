import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getSavedPostsRequest } from "../api/posts";

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedPostsRequest()
      .then(({ data }) => setPosts(data.posts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="mb-4 font-display text-lg font-semibold">Saved posts</h1>

      {loading ? (
        <LoadingSpinner className="py-16" size={28} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={22} />}
          title="Nothing saved yet"
          message="Tap the bookmark icon on any post to keep it here for later."
        />
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDeleted={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
        ))
      )}
    </div>
  );
}
