import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Link as LinkIcon, Settings, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getUserProfileRequest, toggleFollowRequest } from "../api/users";
import { getUserPostsRequest } from "../api/posts";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: profileData }, { data: postsData }] = await Promise.all([
        getUserProfileRequest(username),
        getUserPostsRequest(username),
      ]);
      setProfile(profileData.user);
      setPosts(postsData.posts);
    } catch {
      toast.error("Couldn't find that profile");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFollow = async () => {
    setFollowBusy(true);
    const wasFollowing = profile.isFollowing;
    setProfile((p) => ({
      ...p,
      isFollowing: !wasFollowing,
      followers: wasFollowing
        ? p.followers.filter((f) => f._id !== currentUser._id)
        : [...p.followers, { _id: currentUser._id }],
    }));
    try {
      await toggleFollowRequest(profile._id);
    } catch {
      toast.error("Couldn't update follow status");
      load();
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" size={32} />;
  if (!profile) return <EmptyState title="Profile not found" message="This person doesn't seem to exist on Bloom." />;

  return (
    <div className="mx-auto w-full max-w-2xl pb-10">
      <div
        className="h-40 sm:h-56 w-full"
        style={{
          background: profile.coverImage?.url
            ? `url(${profile.coverImage.url}) center/cover no-repeat`
            : "linear-gradient(120deg, var(--color-pink), var(--color-purple), var(--color-green))",
        }}
      />

      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between -mt-10">
          <Avatar src={profile.avatar?.url} name={profile.name} size="xl" />
          {isOwnProfile ? (
            <button
              onClick={() => navigate("/settings/profile")}
              className="mb-2 flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium"
            >
              <Settings size={15} /> Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followBusy}
              className={`mb-2 rounded-full px-5 py-2 text-sm font-semibold ${
                profile.isFollowing ? "bg-[var(--color-surface-soft)] text-[var(--color-ink-soft)]" : "btn-primary"
              }`}
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <h1 className="mt-3 font-display text-xl font-semibold">{profile.name}</h1>
        <p className="text-sm text-[var(--color-ink-faint)]">@{profile.username}</p>

        {profile.bio && <p className="mt-3 text-sm text-[var(--color-ink)]">{profile.bio}</p>}

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--color-ink-soft)]">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[var(--color-purple-deep)]"
            >
              <LinkIcon size={14} /> {profile.website}
            </a>
          )}
        </div>

        <div className="mt-4 flex gap-5 text-sm">
          <span><strong>{profile.postCount}</strong> <span className="text-[var(--color-ink-faint)]">Posts</span></span>
          <span><strong>{profile.followers?.length || 0}</strong> <span className="text-[var(--color-ink-faint)]">Followers</span></span>
          <span><strong>{profile.following?.length || 0}</strong> <span className="text-[var(--color-ink-faint)]">Following</span></span>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--color-border)] px-4 pt-4 sm:px-6">
        {posts.length === 0 ? (
          <EmptyState
            icon={<ImageIcon size={22} />}
            title="No posts yet"
            message={isOwnProfile ? "Share your first post to see it here." : "This person hasn't posted yet."}
          />
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDeleted={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
          ))
        )}
      </div>
    </div>
  );
}
