const SIZES = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

/**
 * Renders a user avatar framed by the Bloom signature ring.
 * Falls back to the user's initial on a soft gradient when there's no image.
 */
export default function Avatar({ src, name = "", size = "md", ring = true, className = "" }) {
  const sizeClass = SIZES[size] || SIZES.md;
  const initial = name?.trim()?.[0]?.toUpperCase() || "?";

  const inner = src ? (
    <img src={src} alt={name} className={`${sizeClass} object-cover`} />
  ) : (
    <div
      className={`avatar-fallback flex items-center justify-center font-display font-semibold text-[var(--color-purple-deep)] ${sizeClass}`}
      style={{ background: "linear-gradient(135deg, var(--color-pink-soft), var(--color-purple-soft))" }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );

  if (!ring) return <div className={className}>{inner}</div>;

  return <div className={`bloom-ring inline-block ${className}`}>{inner}</div>;
}
