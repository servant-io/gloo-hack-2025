export type ContentItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  url: string | null;
  seriesTitle: string | null;
  durationSeconds: number | null;
  isPremium: boolean;
  uploadDate: string | null;
  contentType: string | null;
  source: string | null;
};

export type VideoRow = Record<string, unknown>;
