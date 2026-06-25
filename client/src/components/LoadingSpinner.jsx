export default function LoadingSpinner({ size = 28, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin"
        style={{ color: "var(--color-purple-deep)" }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="42"
          strokeDashoffset="14"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
