import type { ContentItem } from '../types';

type ContentCarouselProps = {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
  isLoading?: boolean;
};

export function ContentCarousel({
  items,
  selectedId,
  onSelect,
  onExpand,
  isLoading = false,
}: ContentCarouselProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Matches</h2>
          <p className="text-xs text-slate-500">Loading content...</p>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="snap-start w-56 flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse"
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-200" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="flex gap-1 mt-2">
                    <div className="h-5 bg-slate-200 rounded-full w-16" />
                    <div className="h-5 bg-slate-200 rounded-full w-12" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded-full w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
        No content found. Try refining your search.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Matches</h2>
        <p className="text-xs text-slate-500">Scroll horizontally to explore</p>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            const cardClasses = `snap-start w-56 flex-shrink-0 rounded-xl border transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-200'
            }`;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(item.id);
                  }
                }}
                className={`${cardClasses} text-left`}
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {item.seriesTitle || item.source || ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-slate-500">
                    {item.contentType ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {item.contentType}
                      </span>
                    ) : null}
                    {item.isPremium ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-600">
                        Premium
                      </span>
                    ) : null}
                    {item.durationSeconds ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={!item.mediaUrl}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!item.mediaUrl) return;
                      onExpand(item.id);
                    }}
                  >
                    {item.mediaUrl ? 'Preview' : 'No preview'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 rounded-l-2xl bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
