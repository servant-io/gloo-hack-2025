import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface SearchResult {
  id: string;
  title: string;
  training_url: string;
  video_url: string;
  transcript: string;
  transcript_ts: any[];
  relevance_score: number;
  matched_segments?: Array<{
    start: number;
    end: number;
    text: string;
    score: number;
  }>;
}

/**
 * Simple fuzzy search implementation
 */
function fuzzyMatch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 1.0;
  }
  
  // Split query into words and check if all words appear
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
  let matchedWords = 0;
  
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matchedWords++;
    }
  }
  
  // Partial word matches
  let partialMatches = 0;
  for (const word of queryWords) {
    for (let i = 0; i < word.length - 2; i++) {
      const substring = word.substring(i, i + 3);
      if (textLower.includes(substring)) {
        partialMatches++;
        break;
      }
    }
  }
  
  // Calculate score based on word matches and partial matches
  const wordScore = matchedWords / queryWords.length;
  const partialScore = partialMatches / queryWords.length * 0.5;
  
  return Math.max(wordScore, partialScore);
}

/**
 * Search transcripts using fuzzy matching
 */
export async function searchTranscripts(query: string, limit: number = 10): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Get all transcripts from Supabase
    const { data: transcripts, error } = await supabase
      .from('transcripts_videos')
      .select('*');

    if (error) {
      console.error('Error fetching transcripts:', error);
      return [];
    }

    if (!transcripts) {
      return [];
    }

    // Score each transcript
    const scoredResults: SearchResult[] = transcripts.map(transcript => {
      // Search in title
      const titleScore = fuzzyMatch(query, transcript.title || '') * 2; // Weight title matches higher
      
      // Search in transcript text
      const transcriptScore = fuzzyMatch(query, transcript.transcript || '');
      
      // Search in segments for more precise matches
      let segmentScore = 0;
      const matchedSegments: Array<{start: number, end: number, text: string, score: number}> = [];
      
      if (transcript.transcript_ts && Array.isArray(transcript.transcript_ts)) {
        transcript.transcript_ts.forEach((segment: any) => {
          if (segment.text) {
            const score = fuzzyMatch(query, segment.text);
            if (score > 0.3) { // Only include segments with decent matches
              matchedSegments.push({
                start: segment.start || 0,
                end: segment.end || 0,
                text: segment.text,
                score
              });
              segmentScore = Math.max(segmentScore, score);
            }
          }
        });
      }
      
      // Combine scores (title weighted highest, then segments, then full transcript)
      const totalScore = titleScore + segmentScore * 1.5 + transcriptScore;
      
      return {
        ...transcript,
        relevance_score: totalScore,
        matched_segments: matchedSegments.sort((a, b) => b.score - a.score).slice(0, 5) // Top 5 segments
      };
    });

    // Filter out results with no matches and sort by relevance
    return scoredResults
      .filter(result => result.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error in searchTranscripts:', error);
    return [];
  }
}

/**
 * Search for specific segments within transcripts
 */
export async function searchSegments(query: string, limit: number = 20): Promise<Array<{
  transcript_id: string;
  title: string;
  training_url: string;
  video_url: string;
  segment: {
    start: number;
    end: number;
    text: string;
    score: number;
  };
}>> {
  if (!query.trim()) {
    return [];
  }

  try {
    const { data: transcripts, error } = await supabase
      .from('transcripts_videos')
      .select('*');

    if (error || !transcripts) {
      return [];
    }

    const segmentResults: Array<{
      transcript_id: string;
      title: string;
      training_url: string;
      video_url: string;
      segment: {
        start: number;
        end: number;
        text: string;
        score: number;
      };
    }> = [];

    transcripts.forEach(transcript => {
      if (transcript.transcript_ts && Array.isArray(transcript.transcript_ts)) {
        transcript.transcript_ts.forEach((segment: any) => {
          if (segment.text) {
            const score = fuzzyMatch(query, segment.text);
            if (score > 0.3) {
              segmentResults.push({
                transcript_id: transcript.id,
                title: transcript.title,
                training_url: transcript.training_url,
                video_url: transcript.video_url,
                segment: {
                  start: segment.start || 0,
                  end: segment.end || 0,
                  text: segment.text,
                  score
                }
              });
            }
          }
        });
      }
    });

    return segmentResults
      .sort((a, b) => b.segment.score - a.segment.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error in searchSegments:', error);
    return [];
  }
}
