export interface AIWidgetContent {
  id: string;
  queryText: string;
  contentIds: string[];
  overviewText: string;
  keyThemesText: string;
  relevanceText: string;
  createdAt: string;
  expiresAt: string;
}

export interface AIContentSections {
  overview: string;
  keyThemes: string;
  relevance: string;
}

export interface ContentMetadata {
  id: string;
  title: string;
  description: string;
  seriesTitle: string | null;
}
