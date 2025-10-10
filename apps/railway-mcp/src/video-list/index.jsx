import React from "react";
import { createRoot } from "react-dom/client";
import { useWidgetProps } from "../use-widget-props";

function Item({ v }) {
  const title = v?.title || v?.og_title || v?.series_title || v?.id || "Untitled";
  const thumb = v?.thumbnail_url || v?.poster_images?.thumbnail || null;
  const href = v?.url || null;
  const source = v?.source || "";
  const type = v?.content_type || "";

  const open = (e) => {
    if (!href) return;
    e?.preventDefault?.();
    if (window?.openai?.openExternal) {
      window.openai.openExternal({ href });
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-black/5">
      <div className="h-12 w-12 rounded-md overflow-hidden bg-black/5 flex items-center justify-center">
        {thumb ? (
          <img src={thumb} alt="thumb" className="h-full w-full object-cover" />
        ) : (
          <div className="text-xs text-black/40">No image</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-black/60 truncate">
          {source}
          {source && type ? " · " : ""}
          {type}
        </div>
      </div>
      {href ? (
        <button
          onClick={open}
          className="text-sm px-3 py-1 rounded-full bg-black text-white hover:opacity-90"
        >
          Open
        </button>
      ) : null}
    </div>
  );
}

function App() {
  const props = useWidgetProps(() => ({ videos: [], query: "" }));
  const videos = Array.isArray(props?.videos) ? props.videos : [];

  return (
    <div className="antialiased w-full text-black p-3 border border-black/10 rounded-xl bg-white overflow-auto">
      <div className="text-base font-semibold mb-2">Video Results</div>
      {videos.length === 0 ? (
        <div className="text-sm text-black/60 py-6">No results.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {videos.slice(0, 50).map((v, i) => (
            <Item key={v.id ?? i} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("video-list-root")).render(<App />);

