import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { searchContent } from './v2';
import { ContentItem } from '../../types';
import { dbContentItems, glooAffiliateRecommendations } from './v2.test.data';
import { db } from '../../../db/db';
import { fetchAffiliateRecommendations } from '../../glooai';

// Mock the database and GlooAI calls
vi.mock('../../../db/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

vi.mock('../../glooai', () => ({
  fetchAffiliateRecommendations: vi.fn(),
}));

describe('searchContent v2 unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock database query to return test data
    (db.select as vi.Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(dbContentItems),
      }),
    });

    // Mock GlooAI affiliate recommendations to return test data
    (fetchAffiliateRecommendations as vi.Mock).mockResolvedValue(
      glooAffiliateRecommendations
    );
  });

  describe('searchContent function', () => {
    it('should search for "bible" and return combined results sorted by relevance', async () => {
      const results = await searchContent('bible');

      // Should return combined results from both sources
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Verify database was called with correct query
      expect(db.select).toHaveBeenCalled();
      expect(fetchAffiliateRecommendations).toHaveBeenCalledWith('bible');

      // Each result should be a valid ContentItem
      results.forEach((item: ContentItem) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('contentCreatorId');
        expect(item).toHaveProperty('type', 'video');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('shortDescription');
        expect(item).toHaveProperty('thumbnailUrl');
        expect(item).toHaveProperty('mediaUrl');
        expect(item).toHaveProperty('transcript');
        expect(item).toHaveProperty('fullTextUrl');
        expect(item).toHaveProperty('biblicalNarrative');
      });

      // Results should be sorted by relevance (highest scoring first)
      if (results.length > 1) {
        // Check that items with "bible" in the name come first
        const firstItem = results[0];
        expect(firstItem.name.toLowerCase()).toContain('bible');
      }
    });

    it('should search for "acts" and prioritize database results with exact matches', async () => {
      const results = await searchContent('acts');

      // Should return results with "acts" in the name first
      expect(Array.isArray(results)).toBe(true);

      // The first results should be from BibleProject with "Acts" in the title
      const bibleProjectResults = results.filter(
        (item) =>
          item.contentCreatorId === 'bibleproject' &&
          item.name.toLowerCase().includes('acts')
      );

      expect(bibleProjectResults.length).toBeGreaterThan(0);

      // BibleProject results should come before affiliate results for "acts" query
      if (
        bibleProjectResults.length > 0 &&
        results.length > bibleProjectResults.length
      ) {
        const firstBibleProjectIndex = results.findIndex(
          (item) =>
            item.contentCreatorId === 'bibleproject' &&
            item.name.toLowerCase().includes('acts')
        );
        const firstAffiliateIndex = results.findIndex(
          (item) => item.contentCreatorId === 'Crossmap'
        );

        // BibleProject results should come before Crossmap results for "acts" query
        expect(firstBibleProjectIndex).toBeLessThan(firstAffiliateIndex);
      }
    });

    it('should handle empty query gracefully', async () => {
      const results = await searchContent('');

      expect(Array.isArray(results)).toBe(true);
      // Empty query should return all results unsorted
      expect(results.length).toBe(
        dbContentItems.length + glooAffiliateRecommendations.length
      );
    });

    it('should handle query with no results gracefully', async () => {
      // Mock empty results for a non-matching query
      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      (fetchAffiliateRecommendations as Mock).mockResolvedValue([]);

      const results = await searchContent('xyz123nonexistentquery456abc');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should include both database and affiliate results when available', async () => {
      const results = await searchContent('study');

      // Should have results from both sources
      const uniqueCreators = new Set(
        results.map((item) => item.contentCreatorId)
      );

      expect(uniqueCreators.size).toBeGreaterThan(1);
      expect(uniqueCreators.has('bibleproject')).toBe(true);
      expect(uniqueCreators.has('Crossmap')).toBe(true);
    });
  });

  describe('sorting logic validation', () => {
    it('should prioritize exact name matches over partial matches', async () => {
      const results = await searchContent('bible study');

      // Items with "bible study" in the name should come before items with just "bible" or "study"
      const exactMatchItems = results.filter((item) =>
        item.name.toLowerCase().includes('bible study')
      );
      const partialMatchItems = results.filter(
        (item) =>
          item.name.toLowerCase().includes('bible') ||
          item.name.toLowerCase().includes('study')
      );

      if (
        exactMatchItems.length > 0 &&
        partialMatchItems.length > exactMatchItems.length
      ) {
        // Exact matches should come first
        const firstExactMatchIndex = results.findIndex((item) =>
          item.name.toLowerCase().includes('bible study')
        );
        const firstPartialOnlyMatchIndex = results.findIndex(
          (item) =>
            (item.name.toLowerCase().includes('bible') ||
              item.name.toLowerCase().includes('study')) &&
            !item.name.toLowerCase().includes('bible study')
        );

        expect(firstExactMatchIndex).toBeLessThan(firstPartialOnlyMatchIndex);
      }
    });

    it('should give higher weight to name matches than description matches', async () => {
      const results = await searchContent('corinthians');

      // Find items with "corinthians" in name vs description only
      const nameMatches = results.filter((item) =>
        item.name.toLowerCase().includes('corinthians')
      );
      const descriptionOnlyMatches = results.filter(
        (item) =>
          !item.name.toLowerCase().includes('corinthians') &&
          item.shortDescription.toLowerCase().includes('corinthians')
      );

      if (nameMatches.length > 0 && descriptionOnlyMatches.length > 0) {
        // Name matches should come before description-only matches
        const firstNameMatchIndex = results.findIndex((item) =>
          item.name.toLowerCase().includes('corinthians')
        );
        const firstDescriptionOnlyIndex = results.findIndex(
          (item) =>
            !item.name.toLowerCase().includes('corinthians') &&
            item.shortDescription.toLowerCase().includes('corinthians')
        );

        expect(firstNameMatchIndex).toBeLessThan(firstDescriptionOnlyIndex);
      }
    });

    it('should sort by relevance score descending', async () => {
      const results = await searchContent('romans');

      // For a query like "romans", BibleProject videos about Romans should score highest
      const romansVideos = results.filter(
        (item) =>
          item.name.toLowerCase().includes('romans') &&
          item.contentCreatorId === 'bibleproject'
      );

      if (romansVideos.length > 1) {
        // All Romans videos should come before non-Romans content
        const lastRomansIndex = results.findLastIndex(
          (item) =>
            item.name.toLowerCase().includes('romans') &&
            item.contentCreatorId === 'bibleproject'
        );
        const firstNonRomansIndex = results.findIndex(
          (item) =>
            !item.name.toLowerCase().includes('romans') ||
            item.contentCreatorId !== 'bibleproject'
        );

        if (firstNonRomansIndex !== -1) {
          expect(lastRomansIndex).toBeLessThan(firstNonRomansIndex);
        }
      }
    });
  });

  describe('content transformation validation', () => {
    it('should properly transform database items to ContentItem format', async () => {
      const results = await searchContent('acts');

      const bibleProjectItems = results.filter(
        (item) => item.contentCreatorId === 'bibleproject'
      );

      if (bibleProjectItems.length > 0) {
        const sampleItem = bibleProjectItems[0];

        // Verify transformation from database schema to ContentItem
        expect(sampleItem.id).toBeTruthy();
        expect(sampleItem.contentCreatorId).toBe('bibleproject');
        expect(sampleItem.type).toBe('video');
        expect(sampleItem.name).toBeTruthy();
        expect(sampleItem.shortDescription).toBeTruthy();
        // thumbnailUrl and mediaUrl can be empty strings, which is acceptable
        expect(sampleItem.thumbnailUrl).toBeDefined();
        expect(sampleItem.mediaUrl).toBeDefined();
      }
    });

    it('should properly transform affiliate items to ContentItem format', async () => {
      const results = await searchContent('study');

      const crossmapItems = results.filter(
        (item) => item.contentCreatorId === 'Crossmap'
      );

      if (crossmapItems.length > 0) {
        const sampleItem = crossmapItems[0];

        // Verify transformation from affiliate schema to ContentItem
        expect(sampleItem.id).toBeTruthy();
        expect(sampleItem.contentCreatorId).toBe('Crossmap');
        expect(sampleItem.type).toBe('video');
        expect(sampleItem.name).toBeTruthy();
        // shortDescription, thumbnailUrl, and mediaUrl can be empty strings, which is acceptable
        expect(sampleItem.shortDescription).toBeDefined();
        expect(sampleItem.thumbnailUrl).toBeDefined();
        expect(sampleItem.mediaUrl).toBeDefined();
      }
    });
  });
});
