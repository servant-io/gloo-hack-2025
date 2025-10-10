import type { ContentItem } from "../types";

type ContentExpandedCardProps = {
  item: ContentItem;
  onClose: () => void;
  onOpenExternal: (item: ContentItem) => void;
};

export function ContentExpandedCard({
  item,
  onClose,
  onOpenExternal,
}: ContentExpandedCardProps) {
  const videoSrc = pickVideoSource(item);
  const isVideoPlayable = Boolean(videoSrc);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Close preview"
        >
          ×
        </button>

        <div className="grid gap-6 bg-slate-900/95 p-6 text-slate-100 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-8">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl bg-black/60">
              {isVideoPlayable ? (
                <video
                  key={videoSrc ?? undefined}
                  controls
                  preload="metadata"
                  poster={item.thumbnail ?? undefined}
                  className="aspect-video w-full bg-black"
                >
                  <source src={videoSrc ?? undefined} />
                  Your browser does not support embedded video playback.
                </video>
              ) : item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-video flex w-full items-center justify-center text-sm text-slate-400">
                  Preview unavailable
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-300">
              {item.contentType ? (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {item.contentType}
                </span>
              ) : null}
              {item.isPremium ? (
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-200">
                  Premium access
                </span>
              ) : null}
              {item.durationSeconds ? (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {formatDuration(item.durationSeconds)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4 text-slate-800">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Previewing
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {item.title}
              </h2>
              {item.seriesTitle ? (
                <p className="text-sm text-slate-300">{item.seriesTitle}</p>
              ) : null}
            </div>

            {item.description ? (
              <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                {item.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No description provided.</p>
            )}

            <dl className="grid grid-cols-2 gap-4 text-xs text-slate-200">
              {item.source ? (
                <div>
                  <dt className="text-slate-400">Source</dt>
                  <dd className="text-white">{item.source}</dd>
                </div>
              ) : null}
              {item.uploadDate ? (
                <div>
                  <dt className="text-slate-400">Published</dt>
                  <dd className="text-white">{formatDate(item.uploadDate)}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-auto flex flex-col gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                onClick={() => onOpenExternal(item)}
              >
                Open in new tab
              </button>
              {item.isPremium ? (
                <p className="text-xs text-amber-200 bg-amber-500/20 rounded-xl px-3 py-2">
                  Premium content may require credits before playback in the
                  primary app.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pickVideoSource(item: ContentItem): string | null {
  if (!item.url) return null;
  if (item.contentType && item.contentType.toLowerCase().includes('video')) {
    return item.url;
  }

  const lower = item.url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v') || lower.endsWith('.webm')) {
    return item.url;
  }

  return null;
}

function formatDuration(totalSeconds: number | null): string {
  if (!totalSeconds) return "";
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
