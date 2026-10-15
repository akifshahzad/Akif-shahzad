export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-amber-400" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
