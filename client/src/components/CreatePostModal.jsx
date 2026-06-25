import { useRef, useState } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { createPostRequest } from "../api/posts";

const MAX_LEN = 500;

export default function CreatePostModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      toast.error("Write something or add a photo first");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const { data } = await createPostRequest(formData);
      toast.success("Posted!");
      window.dispatchEvent(new CustomEvent("bloom:post-created", { detail: data.post }));
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't publish that post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="card w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 animate-fade-in-up"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Create post</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-soft)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-3">
          <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="What's blooming today?"
            rows={4}
            className="flex-1 resize-none bg-transparent text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none"
          />
        </div>

        {preview && (
          <div className="relative mt-3 overflow-hidden rounded-2xl">
            <img src={preview} alt="Preview" className="max-h-72 w-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="post-image-input"
            />
            <label
              htmlFor="post-image-input"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--color-green-soft)", color: "var(--color-green-deep)" }}
              title="Add photo"
            >
              <ImageIcon size={18} />
            </label>
            <span className="text-xs text-[var(--color-ink-faint)]">{text.length}/{MAX_LEN}</span>
          </div>

          <button
            type="submit"
            disabled={submitting || (!text.trim() && !imageFile)}
            className="btn-primary flex items-center gap-2 rounded-full px-5 py-2 text-sm font-display font-semibold"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
