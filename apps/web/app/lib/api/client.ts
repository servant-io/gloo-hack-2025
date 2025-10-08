export class APIError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
};

function resolveBaseUrl(): string {
  const envValue =
    process.env.NEXT_PUBLIC_CONTENT_PROXY_URL ?? 'http://localhost:3002';

  try {
    const url = new URL(envValue);
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/+$/, '');
  } catch (exception) {
    console.warn(
      `Invalid NEXT_PUBLIC_CONTENT_PROXY_URL "${envValue}", falling back to http://localhost:3002`, JSON.stringify(exception)
    );
    return 'http://localhost:3002';
  }
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(
    path.startsWith('/') ? path : `/${path}`,
    baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers, body, query, signal } = options;

    const url = buildUrl(this.baseUrl, path, query);
    const requestHeaders = new Headers(headers);

    if (method !== 'GET' && body !== undefined && body !== null) {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal,
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : response.statusText) || 'Request failed';

      throw new APIError(message, response.status, payload);
    }

    return payload as T;
  }

  get<T>(path: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }
}

export const apiClient = new ApiClient(resolveBaseUrl());

export type PublisherOverviewResponse = {
  publisherId: string;
  totalEarnings: number;
  monthlyEarnings: number;
  totalRequests: number;
  monthlyRequests: number;
  contentCount: number;
  calculationWindowDays: number;
};

export const analyticsApi = {
  getOverview: (publisherId: string, options: { signal?: AbortSignal } = {}) =>
    apiClient.get<PublisherOverviewResponse>('/api/analytics/overview', {
      signal: options.signal,
      query: { publisherId },
    }),
};
