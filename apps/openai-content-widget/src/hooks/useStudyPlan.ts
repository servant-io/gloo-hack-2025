import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const SESSION_USER_ID = 'demo-user-session';

export interface Bookmark {
  id: string;
  contentId: string;
  bookmarkedAt: string;
  notes: string | null;
}

export function useStudyPlan() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const { data, error: fetchError } = await supabase
          .from('study_plan_bookmarks')
          .select('content_id')
          .eq('user_id', SESSION_USER_ID);

        if (fetchError) throw fetchError;

        const bookmarkSet = new Set((data || []).map((b) => b.content_id));
        setBookmarks(bookmarkSet);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load bookmarks');
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, []);

  // Toggle bookmark for a content item
  const toggleBookmark = useCallback(
    async (contentId: string) => {
      const isBookmarked = bookmarks.has(contentId);

      try {
        if (isBookmarked) {
          // Remove bookmark
          const { error: deleteError } = await supabase
            .from('study_plan_bookmarks')
            .delete()
            .eq('user_id', SESSION_USER_ID)
            .eq('content_id', contentId);

          if (deleteError) throw deleteError;

          setBookmarks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(contentId);
            return newSet;
          });
        } else {
          // Add bookmark
          const { error: insertError } = await supabase
            .from('study_plan_bookmarks')
            .insert({
              user_id: SESSION_USER_ID,
              content_id: contentId,
            });

          if (insertError) throw insertError;

          setBookmarks((prev) => new Set(prev).add(contentId));
        }

        setError(null);
      } catch (err) {
        console.error('Error toggling bookmark:', err);
        setError('Failed to update bookmark');
      }
    },
    [bookmarks]
  );

  // Add note to bookmark
  const addNote = useCallback(async (contentId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('study_plan_bookmarks')
        .update({ notes })
        .eq('user_id', SESSION_USER_ID)
        .eq('content_id', contentId);

      if (error) throw error;
      setError(null);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
    }
  }, []);

  return {
    bookmarks,
    loading,
    error,
    isBookmarked: (contentId: string) => bookmarks.has(contentId),
    toggleBookmark,
    addNote,
  };
}
