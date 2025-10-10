import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { useWidgetProps } from "../use-widget-props";
import { ContentCarousel } from "./components/ContentCarousel";
import { ContentDetailsPanel } from "./components/ContentDetailsPanel";
import { ContentHeader } from "./components/ContentHeader";
import { rowsToContentItems } from "./transform";
import type { ContentItem } from "./types";

type ContentSearchProps = {
  videos?: unknown[];
  query?: string;
  limit?: number;
};

function App() {
  const props = useWidgetProps<ContentSearchProps>(() => ({
    videos: [],
    query: "",
    limit: 0,
  }));

  const items = useMemo(() => rowsToContentItems(props?.videos as any[]), [
    props?.videos,
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null
  );

  useEffect(() => {
    setSelectedId(items[0]?.id ?? null);
  }, [items]);

  const selectedItem: ContentItem | null = useMemo(() => {
    if (!selectedId) return items[0] ?? null;
    return items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedId]);

  const query = typeof props?.query === "string" ? props.query : "";
  const limit = typeof props?.limit === "number" ? props.limit : null;

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 to-white text-slate-900 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <ContentHeader query={query} total={items.length} limit={limit} />

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <ContentCarousel
            items={items}
            selectedId={selectedItem?.id ?? null}
            onSelect={setSelectedId}
          />
          <ContentDetailsPanel item={selectedItem} onOpen={handleOpen} />
        </main>
      </div>
    </div>
  );

  function handleOpen(item: ContentItem) {
    if (!item.url) return;

    if (window?.openai?.openExternal) {
      window.openai.openExternal({ href: item.url });
      return;
    }

    window.open(item.url, "_blank", "noopener,noreferrer");
  }
}

const rootElement = document.getElementById("content-search-root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
}
