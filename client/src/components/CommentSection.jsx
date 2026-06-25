import { useEffect, useState } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import { useAuth } from "../context/AuthContext";
import { getCommentsRequest, addCommentRequest, deleteCommentRequest } from "../api/comments";

export default function CommentSection({ postId, onCommentCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCommentsRequest(postId)
      .then(({ data }) => {
        if (active) setComments(data.comments);
      })
      .catch(() => toast.error("Couldn't load comments"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      const { data } = await addCommentRequest(postId, trimmed);
      setComments((prev) => [data.comment, ...prev]);
      setText("");
      onCommentCountChange?.((c) => c + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add that comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommentRequest(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      onCommentCountChange?.((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete that comment");
    }
  };

  return (
    <div className="border-t border-[var(--color-border)] px-4 py-3">
      <form onSubmit={handleAdd} className="mb-3 flex items-center gap-2">
        <Avatar src={user?.avatar?.url} name={user?.name} size="xs" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 300))}
          placeholder="Add a comment..."
          className="flex-1 rounded-full bg-[var(--color-surface-soft)] px-4 py-2 text-sm outline-none focus-visible:outline-2"
        />
        <button
          type="submit"
          disabled={!text.trim() || posting}
          aria-label="Send comment"
          className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: "var(--color-purple-soft)", color: "var(--color-purple-deep)" }}
        >
          {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>

      {loading ? (
        <p className="py-2 text-center text-sm text-[var(--color-ink-faint)]">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="py-2 text-center text-sm text-[var(--color-ink-faint)]">No comments yet. Say something nice!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment._id} className="flex items-start gap-2.5">
              <Avatar src={comment.author?.avatar?.url} name={comment.author?.name} size="xs" />
              <div className="flex-1 rounded-2xl bg-[var(--color-surface-soft)] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{comment.author?.name}</span>
                  <span className="text-xs text-[var(--color-ink-faint)]">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-[var(--color-ink)] break-words">{comment.text}</p>
              </div>
              {comment.author?._id === user?._id && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  aria-label="Delete comment"
                  className="mt-2 text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
