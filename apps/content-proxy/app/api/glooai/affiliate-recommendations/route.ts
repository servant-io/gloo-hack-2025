import { NextResponse } from 'next/server';
import {
  fetchAffiliateRecommendations,
  type AffiliateRecommendationsRequest,
} from '../../../../lib/glooai/affiliateRecommendations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Parse optional parameters
    const maxSnippetCountOverall = searchParams.get(
      'max_snippet_count_overall'
    );
    const mediaTypes = searchParams.get('media_types');
    const minSnippetCountPerItem = searchParams.get(
      'min_snippet_count_per_item'
    );
    const publishers = searchParams.get('publishers');
    const certaintyThreshold = searchParams.get('certainty_threshold');

    // Build options object for the affiliate recommendations request
    const options: Partial<Omit<AffiliateRecommendationsRequest, 'query'>> = {};

    if (maxSnippetCountOverall) {
      options.max_snippet_count_overall = parseInt(maxSnippetCountOverall, 10);
    }

    if (mediaTypes) {
      options.media_types = mediaTypes.split(',').map((type) => type.trim());
    }

    if (minSnippetCountPerItem) {
      options.min_snippet_count_per_item = parseInt(minSnippetCountPerItem, 10);
    }

    if (publishers) {
      options.publishers = publishers
        .split(',')
        .map((publisher) => publisher.trim());
    }

    if (certaintyThreshold) {
      options.certainty_threshold = parseFloat(certaintyThreshold);
    }

    // Fetch affiliate recommendations from the Gloo AI platform
    const recommendations = await fetchAffiliateRecommendations(q, options);

    return NextResponse.json({
      query: q,
      results: recommendations,
      count: recommendations.length,
      options: Object.keys(options).length > 0 ? options : undefined,
    });
  } catch (error) {
    console.error('Error fetching affiliate recommendations:', error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch affiliate recommendations')) {
        return NextResponse.json(
          { error: 'Failed to fetch recommendations from Gloo AI platform' },
          { status: 502 }
        );
      }
      if (error.message.includes('Failed to fetch access token')) {
        return NextResponse.json(
          { error: 'Authentication failed with Gloo AI platform' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch affiliate recommendations' },
      { status: 500 }
    );
  }
}
