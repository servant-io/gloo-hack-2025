import { ContentItem, VideoRow } from "./types";

function toStringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readPosterThumbnail(row: VideoRow): string | null {
  const field = row.poster_images;
  if (!field) return null;

  if (typeof field === "object" && field !== null) {
    if (
      "thumbnail" in field &&
      typeof (field as Record<string, unknown>).thumbnail === "string"
    ) {
      return toStringOrNull((field as Record<string, unknown>).thumbnail);
    }

    if (Array.isArray(field)) {
      const first = field.find((entry) => typeof entry === "string");
      if (typeof first === "string") {
        return toStringOrNull(first);
      }
    }
  }

  return null;
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

function inferIsPremium(row: VideoRow, durationSeconds: number | null): boolean {
  if (coerceBoolean(row.is_premium)) return true;
  if (durationSeconds && durationSeconds > 600) return true;
  return false;
}

function normalizeRow(row: VideoRow, index: number): ContentItem {
  const id = toStringOrNull(row.id) ?? `item-${index}`;

  const title =
    toStringOrNull(row.title) ??
    toStringOrNull(row.og_title) ??
    toStringOrNull(row.series_title) ??
    id;

  const description =
    toStringOrNull(row.og_description) ??
    toStringOrNull(row.description) ??
    toStringOrNull(row.series_title) ??
    "";

  const thumbnail =
    toStringOrNull(row.thumbnail_url) ?? readPosterThumbnail(row) ?? null;

  const mediaUrl =
    toStringOrNull(row.mp4_url) ?? toStringOrNull(row.media_url) ?? null;

  const canonicalUrl =
    toStringOrNull(row.url) ?? toStringOrNull(row.full_text_url) ?? null;

  const url = canonicalUrl ?? mediaUrl;

  const seriesTitle = toStringOrNull(row.series_title);
  const durationSeconds = toNumberOrNull(row.duration_seconds);
  const contentType = toStringOrNull(row.content_type);
  const source = toStringOrNull(row.source);
  const uploadDate = toStringOrNull(row.upload_date);

  return {
    id,
    title,
    description,
    thumbnail,
    url,
    mediaUrl,
    seriesTitle,
    durationSeconds,
    isPremium: inferIsPremium(row, durationSeconds),
    uploadDate,
    contentType,
    source,
  };
}

export function rowsToContentItems(
  rows: VideoRow[] | undefined | null
): ContentItem[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const safeRow = (row ?? {}) as VideoRow;
    return normalizeRow(safeRow, index);
  });
}
