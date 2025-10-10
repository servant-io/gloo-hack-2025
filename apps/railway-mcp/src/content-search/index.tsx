import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useWidgetProps } from '../use-widget-props';
import { ContentCarousel } from './components/ContentCarousel';
import { ContentExpandedCard } from './components/ContentExpandedCard';
import { rowsToContentItems } from './transform';
import type { ContentItem } from './types';

type ContentSearchProps = {
  videos?: unknown[] | null;
  query?: string;
  limit?: number;
};

function App() {
  const props = useWidgetProps<ContentSearchProps>(() => ({
    videos: undefined,
    query: '',
    limit: 0,
  }));

  const rawVideos = props?.videos;
  const isLoading = rawVideos === undefined || rawVideos === null;

  const items = useMemo(
    () =>
      rowsToContentItems(Array.isArray(rawVideos) ? (rawVideos as any[]) : []),
    [rawVideos]
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setSelectedId(items[0]?.id ?? null);
      setExpandedId(null);
    }
  }, [isLoading, items]);

  const expandedItem = useMemo(() => {
    if (!expandedId) return null;
    return items.find((item) => item.id === expandedId) ?? null;
  }, [expandedId, items]);

  return (
    <div className="min-h-full w-full">
      <div className="rounded-3xl overflow-hidden">
        <div className="min-h-full w-full bg-gradient-to-br from-slate-50 to-white text-slate-900 p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <main>
              <ContentCarousel
                items={items}
                selectedId={selectedId}
                onSelect={(id) => {
                  if (isLoading) return;
                  setSelectedId(id);
                }}
                onExpand={(id) => {
                  if (isLoading) return;
                  setExpandedId(id);
                }}
                isLoading={isLoading}
              />
            </main>
          </div>

          {expandedItem ? (
            <ContentExpandedCard
              item={expandedItem}
              onClose={() => setExpandedId(null)}
              onOpenExternal={handleOpen}
            />
          ) : null}
        </div>
      </div>
    </div>
  );

  function handleOpen(item: ContentItem) {
    if (isLoading) return;
    const targetUrl = item.url ?? item.mediaUrl;
    if (!targetUrl) return;

    if (window?.openai?.openExternal) {
      window.openai.openExternal({ href: targetUrl });
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}

const rootElement = document.getElementById('content-search-root');

if (rootElement) {
  createRoot(rootElement).render(<App />);
}
