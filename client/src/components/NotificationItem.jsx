import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";

const META = {
  like: { icon: Heart, tone: "var(--color-pink-deep)", bg: "var(--color-pink-soft)", verb: "liked your post" },
  comment: { icon: MessageCircle, tone: "var(--color-purple-deep)", bg: "var(--color-purple-soft)", verb: "commented on your post" },
  follow: { icon: UserPlus, tone: "var(--color-green-deep)", bg: "var(--color-green-soft)", verb: "started following you" },
};

export default function NotificationItem({ notification }) {
  const meta = META[notification.type] || META.like;
  const Icon = meta.icon;

  const target = notification.post ? `/post/${notification.post._id}` : `/profile/${notification.sender?.username}`;

  return (
    <Link
      to={target}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--color-surface-soft)] ${
        !notification.read ? "bg-[var(--color-purple-soft)]/40" : ""
      }`}
    >
      <div className="relative">
        <Avatar src={notification.sender?.avatar?.url} name={notification.sender?.name} size="sm" />
        <span
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-surface)]"
          style={{ backgroundColor: meta.bg, color: meta.tone }}
        >
          <Icon size={11} />
        </span>
      </div>
      <p className="text-sm leading-snug">
        <span className="font-semibold">{notification.sender?.name}</span>{" "}
        <span className="text-[var(--color-ink-soft)]">{meta.verb}</span>
      </p>
      <span className="ml-auto shrink-0 text-xs text-[var(--color-ink-faint)]">{timeAgo(notification.createdAt)}</span>
    </Link>
  );
}
