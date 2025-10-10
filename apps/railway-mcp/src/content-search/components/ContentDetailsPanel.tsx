import type { ContentItem } from "../types";

type ContentDetailsPanelProps = {
  item: ContentItem | null;
  onOpen: (item: ContentItem) => void;
  onExpand: (item: ContentItem) => void;
};

export function ContentDetailsPanel({
  item,
  onOpen,
  onExpand,
}: ContentDetailsPanelProps) {
  if (!item) {
    return (
      <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-500">
        Select a result to preview key details.
      </aside>
    );
  }

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Preview
        </p>
        <h2 className="text-xl font-semibold text-slate-900 leading-snug">
          {item.title}
        </h2>
        {item.seriesTitle ? (
          <p className="text-sm text-slate-500 mt-1">{item.seriesTitle}</p>
        ) : null}
      </div>

      {item.description ? (
        <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
          {item.description}
        </p>
      ) : (
        <p className="text-sm text-slate-500">No description available.</p>
      )}

      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
        {item.contentType ? (
          <div>
            <dt className="font-medium text-slate-600">Type</dt>
            <dd className="text-slate-500 capitalize">{item.contentType}</dd>
          </div>
        ) : null}
        {item.durationSeconds ? (
          <div>
            <dt className="font-medium text-slate-600">Duration</dt>
            <dd>{formatDuration(item.durationSeconds)}</dd>
          </div>
        ) : null}
        {item.uploadDate ? (
          <div>
            <dt className="font-medium text-slate-600">Published</dt>
            <dd>{formatDate(item.uploadDate)}</dd>
          </div>
        ) : null}
        {item.source ? (
          <div>
            <dt className="font-medium text-slate-600">Source</dt>
            <dd>{item.source}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onExpand(item)}
          className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
        >
          Preview inline
        </button>
        <button
          type="button"
          onClick={() => onOpen(item)}
          disabled={!item.url}
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {item.url ? "Open content" : "Link unavailable"}
        </button>
        {item.isPremium ? (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Premium access required. Ensure credits are available before
            launching.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
