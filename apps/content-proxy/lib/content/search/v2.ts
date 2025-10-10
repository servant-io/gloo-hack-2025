import { db } from '../../../db/db';
import { contentItems } from '../../../db/schemas/ethan';
import { fetchAffiliateRecommendations } from '../../glooai';
import { AffiliateRecommendationsResponse } from '../../glooai/affiliateRecommendations';
import { ContentItem } from '../../types';
import { ilike, or } from 'drizzle-orm';

export async function searchContent(query: string): Promise<ContentItem[]> {
  const dbSearchResults = await searchDbContent(query);
  const glooAffiliatesSearchResults = await searchGlooAffiliates(query);
  const sortedSearchResults = sortByRelevance(query, [
    ...dbSearchResults,
    ...glooAffiliatesSearchResults,
  ]);
  return sortedSearchResults;
}

async function searchDbContent(query: string): Promise<ContentItem[]> {
  const dbQuery = `%${query}%`;
  const dbContent = await db
    .select()
    .from(contentItems)
    .where(
      or(
        ilike(contentItems.title, dbQuery),
        ilike(contentItems.description, dbQuery),
        ilike(contentItems.seriesTitle, dbQuery),
        ilike(contentItems.ogTitle, dbQuery),
        ilike(contentItems.ogDescription, dbQuery),
        ilike(contentItems.bibleBook, dbQuery),
        ilike(contentItems.fullText, dbQuery)
      )
    );
  return dbContentToContentItems(dbContent);
}

function dbContentToContentItems(
  dbContent: (typeof contentItems.$inferSelect)[]
): ContentItem[] {
  return dbContent.map((item) => ({
    id: item.id,
    contentCreatorId: item.source, // Using source as contentCreatorId
    type: 'video' as const, // Assuming all content is video type
    name: item.title,
    shortDescription: item.description || item.ogDescription || '',
    thumbnailUrl: item.thumbnailUrl || '',
    mediaUrl: item.mediaUrl || item.url,
    transcript: item.fullText || '',
    fullTextUrl: item.url,
    biblicalNarrative: item.bibleBook || '',
  }));
}

async function searchGlooAffiliates(query: string): Promise<ContentItem[]> {
  const affiliateRecommendations = await fetchAffiliateRecommendations(query);
  return glooAffiliatesToContentItems(affiliateRecommendations);
}

function glooAffiliatesToContentItems(
  affiliateRecommendations: AffiliateRecommendationsResponse
): ContentItem[] {
  return affiliateRecommendations.map((item) => ({
    id: item.item_id,
    contentCreatorId: item.publisher || 'unknown',
    type: 'video' as const,
    name: item.item_title || '',
    shortDescription:
      item.summary || item.item_subtitle || item.h2_summary || '',
    thumbnailUrl: item.item_image || item.h2_image || item.h3_image || '',
    mediaUrl: item.item_url || item.hosted_url || '',
    transcript: '',
    fullTextUrl: item.item_url || '',
    /**
     * @todo remove or implement
     * @see https://github.com/servant-io/gloo-hack-2025/issues/32
     **/
    biblicalNarrative: '',
  }));
}

function sortByRelevance(
  query: string,
  searchResults: ContentItem[]
): ContentItem[] {
  if (!query.trim() || searchResults.length === 0) {
    return searchResults;
  }

  const searchWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Early return if no valid search words
  if (searchWords.length === 0) {
    return searchResults;
  }

  const scoredResults = searchResults.map((item) => {
    let score = 0;

    // Precompute lowercase versions only once per item
    const name = item.name.toLowerCase();
    const description = item.shortDescription.toLowerCase();
    const transcript = item.transcript.toLowerCase();
    const biblicalNarrative = item.biblicalNarrative.toLowerCase();

    // Only process non-empty fields
    const hasName = name.length > 0;
    const hasDescription = description.length > 0;
    const hasTranscript = transcript.length > 0;
    const hasBiblicalNarrative = biblicalNarrative.length > 0;

    for (const word of searchWords) {
      // Higher weight for exact matches in name
      if (hasName) {
        if (name === word) {
          score += 10;
        } else if (name.includes(word)) {
          score += 5;
        }
      }

      // Medium weight for description matches
      if (hasDescription && description.includes(word)) {
        score += 3;
      }

      // Lower weight for transcript matches
      if (hasTranscript && transcript.includes(word)) {
        score += 1;
      }

      // Bonus for biblical narrative matches
      if (hasBiblicalNarrative && biblicalNarrative.includes(word)) {
        score += 2;
      }
    }

    return { item, score };
  });

  // Sort by score descending, then by name for tie-breaking
  // Use a more efficient sort by avoiding unnecessary comparisons
  return scoredResults
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.item.name.localeCompare(b.item.name);
    })
    .map((result) => result.item);
}
