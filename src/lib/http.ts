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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the API. Is the backend running?');
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
