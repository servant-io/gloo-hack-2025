import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { VideoContent } from './useVideoData';
import { AIContentSections, ContentMetadata } from '../types/ai-widget';
import { fetchGlooAIRelevance } from '../services/glooAI';

interface UseAIWidgetReturn {
  videos: VideoContent[];
  aiContent: AIContentSections | null;
  loading: boolean;
  error: string | null;
}

export function useAIWidget(
  themeFilter: string = 'Luke-Acts',
  userQuery: string = 'Tell me about Luke-Acts'
): UseAIWidgetReturn {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [aiContent, setAiContent] = useState<AIContentSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWidgetData() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('content_items')
          .select('*')
          .ilike('series_title', `%${themeFilter}%`)
          .order('upload_date', { ascending: true });

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

        const contentMetadata: ContentMetadata[] = videoContent.map((v) => ({
          id: v.id,
          title: v.name,
          description: v.shortDescription,
          seriesTitle: v.seriesTitle,
        }));

        const aiSections = await fetchGlooAIRelevance(
          contentMetadata,
          userQuery
        );
        setAiContent(aiSections);

        setLoading(false);
      } catch (err) {
        console.error('Error loading widget data:', err);
        setError('Failed to load content');
        setLoading(false);
      }
    }

    loadWidgetData();
  }, [themeFilter, userQuery]);

  return {
    videos,
    aiContent,
    loading,
    error,
  };
}
