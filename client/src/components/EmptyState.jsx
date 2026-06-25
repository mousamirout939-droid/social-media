export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      {icon && (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "var(--color-purple-soft)", color: "var(--color-purple-deep)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
      {message && <p className="max-w-sm text-sm text-[var(--color-ink-soft)]">{message}</p>}
      {action}
    </div>
  );
}
