import { Clock, ExternalLink, Lock, X } from 'lucide-react';
import type { ContentItem } from '../types';

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
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center px-4 py-8 sm:px-6">
        <article
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
            {isVideoPlayable ? (
              <video
                key={videoSrc ?? undefined}
                controls
                preload="metadata"
                poster={item.thumbnail ?? undefined}
                className="h-full w-full object-cover"
              >
                <source src={videoSrc ?? undefined} />
                Your browser does not support embedded video playback.
              </video>
            ) : item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-200">
                Preview unavailable
              </div>
            )}

            {item.isPremium ? (
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow">
                <Lock className="h-4 w-4" /> Premium
              </div>
            ) : null}
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <header className="mb-8 space-y-3">
              {item.seriesTitle ? (
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  {item.seriesTitle}
                </div>
              ) : null}
              <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                {item.title}
              </h2>
              {item.description ? (
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {item.description}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  No description provided.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {item.durationSeconds ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(item.durationSeconds)}
                  </span>
                ) : null}
                {item.contentType ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {item.contentType}
                  </span>
                ) : null}
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
              <section className="space-y-6">
                <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Overview
                  </h3>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No overview available.
                    </p>
                  )}
                </article>
              </section>

              <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Details
                </h3>
                <dl className="space-y-3 text-sm text-slate-600">
                  {item.source ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Source</dt>
                      <dd className="text-right font-medium text-slate-700">
                        {item.source}
                      </dd>
                    </div>
                  ) : null}
                  {item.uploadDate ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Published</dt>
                      <dd className="text-right font-medium text-slate-700">
                        {formatDate(item.uploadDate)}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <button
                  type="button"
                  onClick={() => onOpenExternal(item)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Content
                </button>

                {item.isPremium ? (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                    Premium access required. Ensure credits are available before
                    launching.
                  </p>
                ) : null}
              </aside>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function pickVideoSource(item: ContentItem): string | null {
  if (item.mediaUrl) return item.mediaUrl;
  if (!item.url) return null;
  if (item.contentType && item.contentType.toLowerCase().includes('video')) {
    return item.url;
  }

  const lower = item.url.toLowerCase();
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.m4v') ||
    lower.endsWith('.webm')
  ) {
    return item.url;
  }

  return null;
}

function formatDuration(totalSeconds: number | null): string {
  if (!totalSeconds) return '';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
