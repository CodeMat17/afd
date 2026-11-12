/** Route-level loading state for the dynamic sections (account dashboard, admin, checkout). */
export function PageLoading() {
  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] flex-col items-center justify-center gap-6 px-4" role="status">
      <div className="relative h-px w-40 overflow-hidden bg-border">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-loading bg-primary" />
      </div>
      <p className="font-heading text-2xl text-muted-foreground italic">Unfolding…</p>
    </div>
  );
}
