import { useState, useEffect, useRef, useCallback } from 'react';
import type { ContentItemWithPublisher } from '@/lib/content/types';

interface UseSearchProps {
  debounceDelay?: number;
}

interface SearchState {
  searchResults: ContentItemWithPublisher[];
  searchTerm: string;
  isSearching: boolean;
  isDebouncing: boolean;
  error: string | null;
}

export function useSearch({ debounceDelay = 300 }: UseSearchProps = {}) {
  const [state, setState] = useState<SearchState>({
    searchResults: [],
    searchTerm: '',
    isSearching: false,
    isDebouncing: false,
    error: null,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setState((prev) => ({
        ...prev,
        searchResults: [],
        isSearching: false,
        error: null,
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
      }));

      const response = await fetch(
        `/api/content/search?q=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();

      setState((prev) => ({
        ...prev,
        searchResults: data.results || [],
        isSearching: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Search failed',
        searchResults: [],
        isSearching: false,
      }));
    }
  }, []);

  const handleSearchInput = useCallback(
    (term: string) => {
      setState((prev) => ({
        ...prev,
        searchTerm: term,
        isDebouncing: !!term.trim(),
      }));

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!term.trim()) {
        setState((prev) => ({
          ...prev,
          searchResults: [],
          isSearching: false,
          isDebouncing: false,
        }));
        return;
      }

      // Set new timeout for debounced search
      debounceRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isDebouncing: false }));
        performSearch(term);
      }, debounceDelay);
    },
    [debounceDelay, performSearch]
  );

  const clearSearch = useCallback(() => {
    setState({
      searchResults: [],
      searchTerm: '',
      isSearching: false,
      isDebouncing: false,
      error: null,
    });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    ...state,
    handleSearchInput,
    clearSearch,
  };
}
