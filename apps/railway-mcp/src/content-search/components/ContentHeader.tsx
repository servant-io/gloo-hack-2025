type ContentHeaderProps = {
  query: string;
  total: number;
  limit: number | null;
};

export function ContentHeader({ query, total, limit }: ContentHeaderProps) {
  const formattedQuery = query.trim().length > 0 ? query.trim() : "Everything";

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Content search results
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {formattedQuery}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            {total} result{total === 1 ? "" : "s"}
          </span>
          {limit ? (
            <span className="hidden sm:inline text-xs text-slate-400">
              Showing up to {limit}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
