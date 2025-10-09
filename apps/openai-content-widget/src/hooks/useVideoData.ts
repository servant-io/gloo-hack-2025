import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface VideoContent {
  id: string;
  name: string;
  shortDescription: string;
  thumbnailUrl: string;
  mediaUrl: string;
  seriesTitle: string | null;
  durationSeconds: number;
  isPremium: boolean;
  uploadDate: string | null;
}

export interface SeriesGroup {
  seriesTitle: string;
  videos: VideoContent[];
  totalVideos: number;
  hasPremium: boolean;
}

export function useVideoData() {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [seriesGroups, setSeriesGroups] = useState<SeriesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error: fetchError } = await supabase
          .from('content_items')
          .select('*')
          .order('upload_date', { ascending: false });

        if (fetchError) throw fetchError;

        const videoContent: VideoContent[] = (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          shortDescription: item.short_description,
          thumbnailUrl: item.thumbnail_url,
          mediaUrl: item.media_url,
          seriesTitle: item.series_title,
          durationSeconds: item.duration_seconds,
          isPremium: item.is_premium,
          uploadDate: item.upload_date,
        }));

        setVideos(videoContent);

        // Group by series
        const groupMap = new Map<string, VideoContent[]>();
        videoContent.forEach((video) => {
          const series = video.seriesTitle || 'Other';
          if (!groupMap.has(series)) {
            groupMap.set(series, []);
          }
          groupMap.get(series)!.push(video);
        });

        const groups: SeriesGroup[] = Array.from(groupMap.entries()).map(
          ([seriesTitle, videos]) => ({
            seriesTitle,
            videos,
            totalVideos: videos.length,
            hasPremium: videos.some((v) => v.isPremium),
          })
        );

        setSeriesGroups(groups);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return {
    videos,
    seriesGroups,
    loading,
    error,
  };
}
