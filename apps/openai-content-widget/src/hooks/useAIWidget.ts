import { useState, useEffect, useRef } from 'react';
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
  userQuery: string = 'Tell me about Luke-Acts',
  conversationContext?: string
): UseAIWidgetReturn {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [aiContent, setAiContent] = useState<AIContentSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate calls during React StrictMode double-invoke
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If already loading, skip this call (handles StrictMode double-invoke)
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    async function loadWidgetData() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('content_items')
          .select('*')
          .ilike('series_title', `%${themeFilter}%`)
          .order('upload_date', { ascending: true });

        if (signal.aborted) return;
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

        if (signal.aborted) return;
        setVideos(videoContent);

        const contentMetadata: ContentMetadata[] = videoContent.map((v) => ({
          id: v.id,
          title: v.name,
          description: v.shortDescription,
          seriesTitle: v.seriesTitle,
        }));

        const aiSections = await fetchGlooAIRelevance(
          contentMetadata,
          userQuery,
          conversationContext
        );

        if (signal.aborted) return;
        setAiContent(aiSections);
        setLoading(false);
      } catch (err) {
        if (signal.aborted) return;
        console.error('Error loading widget data:', err);
        setError('Failed to load content');
        setLoading(false);
      } finally {
        loadingRef.current = false;
      }
    }

    loadWidgetData();

    // Cleanup: abort any in-flight requests if component unmounts or deps change
    return () => {
      abortControllerRef.current?.abort();
      loadingRef.current = false;
    };
  }, [themeFilter, userQuery, conversationContext]);

  return {
    videos,
    aiContent,
    loading,
    error,
  };
}
