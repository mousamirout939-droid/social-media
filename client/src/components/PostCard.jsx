import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";
import { timeAgo } from "../utils/timeAgo";
import { useAuth } from "../context/AuthContext";
import { toggleLikeRequest, toggleSaveRequest, deletePostRequest } from "../api/posts";

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [popLike, setPopLike] = useState(false);

  const isOwner = post.author?._id === user?._id;

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : c - 1));
    if (nextLiked) {
      setPopLike(true);
      setTimeout(() => setPopLike(false), 320);
    }
    try {
      await toggleLikeRequest(post._id);
    } catch {
      setLiked(!nextLiked);
      setLikeCount((c) => (nextLiked ? c - 1 : c + 1));
      toast.error("Couldn't update your like");
    }
  };

  const handleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await toggleSaveRequest(post._id);
      toast.success(next ? "Saved to your collection" : "Removed from saved");
    } catch {
      setSaved(!next);
      toast.error("Couldn't update saved posts");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePostRequest(post._id);
      toast.success("Post deleted");
      onDeleted?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete post");
    }
  };

  return (
    <article className="card mb-4 overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-4 pt-4">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
          <Avatar src={post.author?.avatar?.url} name={post.author?.name} size="sm" />
          <div>
            <p className="text-sm font-semibold leading-tight">{post.author?.name}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">
              @{post.author?.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Post options"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-soft)]"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-10 w-36 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-pink-soft)]"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {post.text && <p className="whitespace-pre-wrap px-4 pb-3 pt-2 text-[var(--color-ink)]">{post.text}</p>}

      {post.image?.url && (
        <img
          src={post.image.url}
          alt="Post attachment"
          loading="lazy"
          className="max-h-[560px] w-full object-cover"
        />
      )}

      <div className="flex items-center gap-1 px-3 py-2">
        <button
          onClick={handleLike}
          aria-pressed={liked}
          aria-label="Like post"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-[var(--color-pink-soft)]"
        >
          <Heart
            size={20}
            className={popLike ? "animate-bloom-pop" : ""}
            fill={liked ? "var(--color-pink-deep)" : "none"}
            color={liked ? "var(--color-pink-deep)" : "var(--color-ink-soft)"}
          />
          <span className="text-sm text-[var(--color-ink-soft)]">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          aria-label="View comments"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-[var(--color-purple-soft)]"
        >
          <MessageCircle size={20} color="var(--color-ink-soft)" />
          <span className="text-sm text-[var(--color-ink-soft)]">{commentCount}</span>
        </button>

        <button
          onClick={handleSave}
          aria-pressed={saved}
          aria-label="Save post"
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-[var(--color-green-soft)]"
        >
          <Bookmark
            size={20}
            fill={saved ? "var(--color-green-deep)" : "none"}
            color={saved ? "var(--color-green-deep)" : "var(--color-ink-soft)"}
          />
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post._id} onCommentCountChange={(updater) => setCommentCount(updater)} />
      )}
    </article>
  );
}
