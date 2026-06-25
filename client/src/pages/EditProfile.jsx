import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { updateProfileRequest, updateAvatarRequest, updateCoverRequest } from "../api/users";

export default function EditProfile() {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfileRequest(form);
      updateLocalUser(data.user);
      toast.success("Profile updated");
      navigate(`/profile/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await updateAvatarRequest(formData);
      updateLocalUser(data.user);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const { data } = await updateCoverRequest(formData);
      updateLocalUser(data.user);
      toast.success("Cover photo updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't upload photo");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-surface-soft)]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-lg font-semibold">Edit profile</h1>
      </div>

      <div className="card overflow-hidden">
        <div
          className="relative h-32 w-full"
          style={{
            background: user?.coverImage?.url
              ? `url(${user.coverImage.url}) center/cover no-repeat`
              : "linear-gradient(120deg, var(--color-pink), var(--color-purple), var(--color-green))",
          }}
        >
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Change cover photo"
          >
            {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>

          <div className="absolute -bottom-8 left-4">
            <div className="relative">
              <Avatar src={user?.avatar?.url} name={user?.name} size="lg" />
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-black/60 text-white"
                aria-label="Change profile photo"
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pt-12 pb-5">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={50}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="bio" className="mb-1 block text-sm font-medium">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={160}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
            <p className="mt-1 text-right text-xs text-[var(--color-ink-faint)]">{form.bio.length}/160</p>
          </div>
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              maxLength={60}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>
          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium">Website</label>
            <input
              id="website"
              name="website"
              value={form.website}
              onChange={handleChange}
              maxLength={100}
              placeholder="yourname.com"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 outline-none focus-visible:outline-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-xl py-2.5 font-display font-semibold"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
