export default function Logo({ size = "md", showWordmark = true }) {
  const glyphSize = size === "lg" ? 36 : size === "sm" ? 24 : 30;
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-2">
      <svg width={glyphSize} height={glyphSize} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-pink-deep)" />
            <stop offset="50%" stopColor="var(--color-purple-deep)" />
            <stop offset="100%" stopColor="var(--color-green-deep)" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="14" r="9" fill="url(#logo-g)" />
        <circle cx="14" cy="28" r="9" fill="url(#logo-g)" opacity="0.85" />
        <circle cx="34" cy="28" r="9" fill="url(#logo-g)" opacity="0.85" />
        <circle cx="24" cy="24" r="6" fill="var(--color-bg)" />
      </svg>
      {showWordmark && (
        <span className={`font-display font-semibold bloom-gradient-text ${textSize}`}>Bloom</span>
      )}
    </div>
  );
}
