export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string };
};

function isDevChatDebug() {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  return /aitrainersdev|localhost|127\.0\.0\.1|netlify\.app$/.test(window.location.hostname);
}

function hasRequestBody(body: BodyInit | null | undefined): boolean {
  return body !== undefined && body !== null && body !== '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const jsonBody = hasRequestBody(body) && !(body instanceof FormData);

  if (jsonBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  if (!jsonBody) {
    headers.delete('content-type');
  }

  const method = (init?.method ?? 'GET').toUpperCase();
  if (isDevChatDebug() && path.includes('/chat')) {
    console.log('[Inbox] request:', method, path);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      method,
      credentials: 'include',
      headers,
      body: jsonBody ? body : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the API. Is the backend running?');
  }

  if (isDevChatDebug() && path.includes('/chat')) {
    console.log('[Inbox] response:', response.status, path);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/csv')) {
    const csv = await response.text();
    if (!response.ok) {
      throw new ApiError(response.status, 'REQUEST_ERROR', 'Export failed');
    }
    return csv as T;
  }

  const data = (await response.json().catch(() => ({}))) as ErrorBody & T;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code ?? 'REQUEST_ERROR',
      data.error?.message ?? 'Something went wrong. Please try again.',
    );
  }
  return data as T;
}

export { request };
