import {
  toContentItemsSourceName,
  toContentItemsSourceShortDescription,
} from '@/lib/content-items-sources';
import { SourcedContentItem } from '@/lib/content-items-sources/types';
import { ContentItem } from '@/lib/types';
import { google, youtube_v3 as YouTubeV3 } from 'googleapis';

const YouTube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Gets the uploads playlist ID for a YouTube channel.
 * @param {string} channelUrl The browser URL of the YouTube channel
 * @returns {Promise<string | undefined>} The uploads playlist ID or undefined if not found.
 */
export async function getYouTubeChannelUploadsPlaylistId(
  channelUrl: string
): Promise<string | undefined> {
  const channelHandle = channelUrl.split('@')[1];
  const channelResponse = await YouTube.channels.list({
    forHandle: channelHandle,
    maxResults: 1,
    part: ['contentDetails'],
  });

  const uploadsPlaylistId =
    channelResponse?.data?.items?.[0]?.contentDetails?.relatedPlaylists
      ?.uploads;

  return uploadsPlaylistId;
}

/**
 * Fetches all video IDs from a YouTube channel.
 * @param {string} channelUrl The ID of the YouTube channel (e.g., 'UC...')
 * @returns {Promise<string[]>} An array of video IDs.
 */
export async function extractYouTubeChannelVideos(
  channelUrl: string
): Promise<SourcedContentItem[]> {
  try {
    const uploadsPlaylistId =
      await getYouTubeChannelUploadsPlaylistId(channelUrl);
    if (!uploadsPlaylistId) return [];

    let sourcedContentItems: SourcedContentItem[] = [];
    let nextPageToken: string | null | undefined = undefined;

    do {
      const playlistResponse = await YouTube.playlistItems.list({
        playlistId: uploadsPlaylistId,
        part: ['contentDetails', 'snippet'],
        maxResults: 50,
        pageToken: nextPageToken,
      });
      const playlist =
        playlistResponse.data as YouTubeV3.Schema$PlaylistItemListResponse;
      const playlistVideos =
        playlist?.items
          ?.filter((item: YouTubeV3.Schema$PlaylistItem) =>
            Boolean(item.contentDetails?.videoId)
          )
          ?.map((item: YouTubeV3.Schema$PlaylistItem) => ({
            name: toContentItemsSourceName(item.snippet?.title),
            type: 'video' as ContentItem['type'],
            contentUrl: `https://www.youtube.com/embed/${item.contentDetails!.videoId}`,
            shortDescription: toContentItemsSourceShortDescription(
              item.snippet?.description
            ),
            thumbnailUrl:
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url ||
              undefined,
          })) || [];

      sourcedContentItems.push(...playlistVideos);
      nextPageToken = playlist.nextPageToken;
    } while (nextPageToken);

    return sourcedContentItems;
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('YouTube API Error:', error.name, error.message);
    else console.error('YouTube API Error:', error);
    return [];
  }
}

/**
 * Validates a YouTube channel handle. It must start with "@", followed by 3-30 valid chars, no invalid patterns at end
 * @param {string} channelHandle The YouTube channel handle (e.g., '@example')
 * @returns {boolean}
 */
export function isValidYouTubeChannelHandle(channelHandle: string): boolean {
  return (
    // starts with "@" and is 4-31 characters long, allowing letters, numbers, periods, underscores, hyphens
    /^@([a-zA-Z0-9._-]{3,30})$/.test(channelHandle) &&
    // no consecutive periods, underscores, or hyphens
    !/[._-]{2,}/.test(channelHandle) &&
    // cannot end with period, underscore, hyphen
    !/[._-]$/.test(channelHandle)
  );
}
