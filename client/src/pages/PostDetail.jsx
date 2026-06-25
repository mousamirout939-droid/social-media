import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPostByIdRequest } from "../api/posts";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostByIdRequest(id)
      .then(({ data }) => setPost(data.post))
      .catch(() => toast.error("That post doesn't exist anymore"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-surface-soft)]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-lg font-semibold">Post</h1>
      </div>

      {loading ? (
        <LoadingSpinner className="py-16" size={28} />
      ) : post ? (
        <PostCard post={post} onDeleted={() => navigate("/")} />
      ) : (
        <p className="py-16 text-center text-sm text-[var(--color-ink-faint)]">This post couldn't be found.</p>
      )}
    </div>
  );
}
