import type { ContentItem } from '../types';

/**
 * Simple fuzzy search implementation
 * Searches through name and shortDescription fields
 * Returns items where any word in the search term partially matches
 */
export function fuzzySearch(
  content: ContentItem[],
  searchTerm: string
): ContentItem[] {
  if (!searchTerm.trim()) {
    return [];
  }

  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return content.filter((item) => {
    const searchableText =
      `${item.name} ${item.shortDescription}`.toLowerCase();

    // Count how many search words match in the searchable text
    const matchCount = searchWords.filter((word) =>
      searchableText.includes(word)
    ).length;

    // Return true if at least one word matches
    return matchCount > 0;
  });
}

/**
 * Simple scoring function to rank search results
 * Higher score for matches in name vs description
 * Higher score for more word matches
 */
export function scoreItem(item: ContentItem, searchWords: string[]): number {
  const name = item?.name?.toLowerCase();
  const description = item?.shortDescription?.toLowerCase();

  let score = 0;

  searchWords.forEach((word) => {
    if (name?.includes(word)) {
      score += 3; // Higher weight for name matches
    }
    if (description?.includes(word)) {
      score += 1; // Lower weight for description matches
    }
  });

  return score;
}

/**
 * Main search function that performs fuzzy search and returns top 5 results
 */
export function searchContent(
  content: ContentItem[],
  searchTerm: string,
  limit: number = 5
): {
  results: ContentItem[];
  totalMatches: number;
  searchTerm: string;
} {
  if (!searchTerm.trim()) {
    return {
      results: [],
      totalMatches: 0,
      searchTerm,
    };
  }

  // Perform fuzzy search
  const searchResults = fuzzySearch(content, searchTerm);

  // Score and sort results
  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const scoredResults = searchResults.map((item) => ({
    item,
    score: scoreItem(item, searchWords),
  }));

  // Sort by score (descending) and take top results
  const topResults = scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => result.item);

  return {
    results: topResults,
    totalMatches: searchResults.length,
    searchTerm,
  };
}
