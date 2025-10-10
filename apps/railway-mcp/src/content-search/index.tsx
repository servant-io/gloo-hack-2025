import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useWidgetProps } from '../use-widget-props';
import { ContentCarousel } from './components/ContentCarousel';
import { ContentExpandedCard } from './components/ContentExpandedCard';
import { ContentHeader } from './components/ContentHeader';
import { rowsToContentItems } from './transform';
import type { ContentItem } from './types';

type ContentSearchProps = {
  videos?: unknown[];
  query?: string;
  limit?: number;
};

function App() {
  const props = useWidgetProps<ContentSearchProps>(() => ({
    videos: [],
    query: '',
    limit: 0,
  }));

  const items = useMemo(
    () => rowsToContentItems(props?.videos as any[]),
    [props?.videos]
  );

  // Determine if we're loading based on whether videos prop is still undefined/null
  const isLoading = props?.videos === undefined || props?.videos === null;
  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(items[0]?.id ?? null);
    setExpandedId(null);
  }, [items]);

  const query = typeof props?.query === 'string' ? props.query : '';
  const limit = typeof props?.limit === 'number' ? props.limit : null;
  const expandedItem = useMemo(() => {
    if (!expandedId) return null;
    return items.find((item) => item.id === expandedId) ?? null;
  }, [expandedId, items]);

  return (
    <div className="min-h-full w-full">
      <div className="rounded-3xl overflow-hidden">
        <div className="min-h-full w-full bg-gradient-to-br from-slate-50 to-white text-slate-900 p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <ContentHeader query={query} total={items.length} limit={limit} />

            <main>
              <ContentCarousel
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onExpand={setExpandedId}
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
