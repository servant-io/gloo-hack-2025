import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIError,
  PublisherOverviewResponse,
  analyticsApi,
} from '@/lib/api/client';

export type PublisherOverviewState = {
  data: PublisherOverviewResponse | null;
  loading: boolean;
  error: APIError | Error | null;
  refetch: () => Promise<void>;
};

export function usePublisherOverview(
  publisherId: string | null
): PublisherOverviewState {
  const [data, setData] = useState<PublisherOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<APIError | Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!publisherId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await analyticsApi.getOverview(publisherId, {
        signal: controller.signal,
      });
      setData(response);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      setError(err as APIError | Error);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [publisherId]);

  useEffect(() => {
    void fetchData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
