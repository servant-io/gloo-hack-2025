import { ContentItem } from '../types/types';

interface RawVideoData {
  title: string;
  description?: string;
  og_description?: string;
  duration_seconds: number;
  mp4_url?: string;
  thumbnail_url: string;
  upload_date: string;
  series_title?: string;
  transcripts?: string[];
  url: string;
  poster_images?: string[];
}

/**
 * Generates a unique hex ID for content items
 */
export function generateContentId(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Determines if content should be premium based on series and duration
 */
export function isPremiumContent(
  seriesTitle?: string,
  durationSeconds?: number
): boolean {
  // Premium logic: Videos over 10 minutes from certain series
  const premiumSeries = [
    'Sermon on the Mount',
    'Luke-Acts',
    'Royal Priesthood',
    'Creation',
  ];

  if (seriesTitle && premiumSeries.some((ps) => seriesTitle.includes(ps))) {
    return true;
  }

  // Videos longer than 10 minutes are premium
  if (durationSeconds && durationSeconds > 600) {
    return true;
  }

  return false;
}

/**
 * Formats video duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Transforms raw JSON video data to ContentItem format
 */
export function transformVideoToContentItem(video: RawVideoData): ContentItem {
  return {
    id: generateContentId(),
    contentCreatorId: 'bibleproject',
    type: 'video',
    name: video.title,
    shortDescription: video.og_description || video.description || '',
    thumbnailUrl: video.thumbnail_url,
    mediaUrl: video.mp4_url || '',
    transcriptUrl: video.transcripts?.[0] || '',
    fullTextUrl: video.url || '',
    biblicalNarrative: (video.description || '').substring(0, 280),
  };
}

/**
 * Transforms raw video data for database insertion
 */
export function transformForDatabase(video: RawVideoData) {
  const contentItem = transformVideoToContentItem(video);

  return {
    id: contentItem.id,
    content_creator_id: contentItem.contentCreatorId,
    type: contentItem.type,
    name: contentItem.name,
    short_description: contentItem.shortDescription,
    thumbnail_url: contentItem.thumbnailUrl,
    media_url: contentItem.mediaUrl,
    transcript_url: contentItem.transcriptUrl,
    full_text_url: contentItem.fullTextUrl,
    biblical_narrative: contentItem.biblicalNarrative,
    series_title: video.series_title || null,
    duration_seconds: video.duration_seconds || 0,
    upload_date: video.upload_date
      ? new Date(video.upload_date).toISOString()
      : null,
    is_premium: isPremiumContent(video.series_title, video.duration_seconds),
  };
}

/**
 * Groups content items by series title
 */
export interface SeriesGroup {
  seriesTitle: string;
  items: ContentItem[];
  totalDuration: number;
  isPremium: boolean;
}

export function groupBySeries(
  items: ContentItem[],
  durations: Map<string, number>
): SeriesGroup[] {
  const groupMap = new Map<string, ContentItem[]>();

  items.forEach((item) => {
    const series = item.contentCreatorId || 'Other';
    if (!groupMap.has(series)) {
      groupMap.set(series, []);
    }
    groupMap.get(series)!.push(item);
  });

  return Array.from(groupMap.entries()).map(([seriesTitle, items]) => {
    const totalDuration = items.reduce(
      (sum, item) => sum + (durations.get(item.id) || 0),
      0
    );
    const isPremium = items.some((item) => durations.get(item.id)! > 600);

    return {
      seriesTitle,
      items,
      totalDuration,
      isPremium,
    };
  });
}

/**
 * Calculates estimated read time for text content
 */
export function estimateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
