import { fetchAccessToken } from './accessToken';

export interface AffiliateRecommendationsRequest {
  query: string;
  max_snippet_count_overall?: number;
  media_types?: string[];
  min_snippet_count_per_item?: number;
  publishers?: string[];
  certainty_threshold?: number;
}

export interface AffiliateRecommendationsResponseItem {
  item_id: string;
  item_title: string;
  publisher: string;
  type: string;
  cumulative_certainty: number;
  item_url: string;
  author?: string[];
  item_image?: string;
  publication_date?: string;
  snippet_count?: number;
  filename?: string;
  denomination?: string;
  duration?: string;
  item_subtitle?: string;
  item_tags?: string;
  h2_id?: string;
  h2_title?: string;
  h2_subtitle?: string;
  h2_image?: string;
  h2_url?: string;
  h2_tags?: string | null;
  h3_id?: string;
  h3_title?: string;
  h3_subtitle?: string;
  h3_image?: string;
  h3_url?: string;
  h3_tags?: string | null;
  h2_summary?: string;
  publisher_id?: string;
  publisher_url?: string;
  publisher_logo?: string;
  summary?: string;
  hosted_url?: string;
}

export type AffiliateRecommendationsResponse =
  AffiliateRecommendationsResponseItem[];

export async function fetchAffiliateRecommendations(
  query: string,
  options: Partial<Omit<AffiliateRecommendationsRequest, 'query'>> = {}
): Promise<AffiliateRecommendationsResponse> {
  const accessToken = await fetchAccessToken();

  const requestBody: AffiliateRecommendationsRequest = {
    query,
    max_snippet_count_overall: options.max_snippet_count_overall ?? 100,
    media_types: options.media_types ?? ['article', 'book'],
    min_snippet_count_per_item: options.min_snippet_count_per_item ?? 2,
    publishers: options.publishers ?? [],
    certainty_threshold: options.certainty_threshold ?? 0.3,
  };

  const response = await fetch(
    'https://platform.ai.gloo.com/ai/v1/data/affiliates/referenced-items',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch affiliate recommendations: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as AffiliateRecommendationsResponse;
}
