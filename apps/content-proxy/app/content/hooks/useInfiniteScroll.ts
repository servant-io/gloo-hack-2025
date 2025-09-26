import { useState, useEffect, useRef, useCallback } from 'react';
import type { ContentItemWithPublisher } from '@/lib/content/types';

interface UseInfiniteScrollProps {
  initialPage?: number;
  itemsPerPage?: number;
}

interface InfiniteScrollState {
  content: ContentItemWithPublisher[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  totalItems: number;
}

/**
 * @todo fix bug infinite scroll is not yet working
 */
export function useInfiniteScroll({
  initialPage = 1,
  itemsPerPage = 10,
}: UseInfiniteScrollProps = {}) {
  const [state, setState] = useState<InfiniteScrollState>({
    content: [],
    loading: true,
    loadingMore: false,
    error: null,
    currentPage: initialPage,
    hasMore: true,
    totalItems: 0,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // Refs for latest state values
  const currentPageRef = useRef(state.currentPage);
  const hasMoreRef = useRef(state.hasMore);
  const loadingMoreRef = useRef(state.loadingMore);

  useEffect(() => {
    currentPageRef.current = state.currentPage;
  }, [state.currentPage]);

  useEffect(() => {
    hasMoreRef.current = state.hasMore;
  }, [state.hasMore]);

  useEffect(() => {
    loadingMoreRef.current = state.loadingMore;
  }, [state.loadingMore]);

  const fetchContent = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: page === 1,
          loadingMore: page > 1,
          error: null,
        }));

        const response = await fetch(
          `/api/content?page=${page}&limit=${itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();

        setState((prev) => ({
          ...prev,
          content: append ? [...prev.content, ...data.items] : data.items,
          totalItems: data.total,
          hasMore: data.hasMore,
          currentPage: page,
          loading: false,
          loadingMore: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'An error occurred',
          loading: false,
          loadingMore: false,
        }));
      }
    },
    [itemsPerPage]
  );

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || loadingMoreRef.current || fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    fetchContent(currentPageRef.current + 1, true).finally(() => {
      fetchingRef.current = false;
    });
  }, [fetchContent]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !state.hasMore) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        hasMoreRef.current &&
        !loadingMoreRef.current &&
        !fetchingRef.current
      ) {
        loadMore();
      }
    };

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state.hasMore, loadMore]);

  // Callback ref to handle element mounting
  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        loadMoreRef.current = node;

        // Re-setup observer when element is mounted
        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        if (node && state.hasMore) {
          const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (
              target.isIntersecting &&
              hasMoreRef.current &&
              !loadingMoreRef.current &&
              !fetchingRef.current
            ) {
              loadMore();
            }
          };

          const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.1,
            rootMargin: '100px',
          });

          observer.observe(node);
          observerRef.current = observer;
        }
      }
    },
    [state.hasMore, loadMore]
  );

  // Fetch initial content
  useEffect(() => {
    fetchContent(initialPage, false);
  }, [fetchContent, initialPage]);

  return {
    ...state,
    loadMoreRef: setLoadMoreRef,
    refetch: () => fetchContent(1, false),
  };
}
