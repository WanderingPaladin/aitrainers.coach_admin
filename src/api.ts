import { clearStoredApiKey, getStoredApiKey } from './auth';
import type { Application, ApplicationDetail, ApplicationStatus, Paginated } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStoredApiKey()}`,
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    clearStoredApiKey();
    throw new ApiError('Unauthorized. Check the admin API key.', 401);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: { message?: string }; message?: string };
      message = body.error?.message ?? body.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listApplications(params: {
  q?: string;
  status?: ApplicationStatus | '';
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 50));
  return request<Paginated<Application>>(`/v1/admin/applications?${query}`);
}

export function getApplication(id: string) {
  return request<{ application: ApplicationDetail }>(`/v1/admin/applications/${id}`);
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return request<{ application: Application }>(`/v1/admin/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function cancelBooking(id: string) {
  return request<{ booking: { id: string } }>(`/v1/admin/bookings/${id}/cancel`, {
    method: 'POST',
  });
}
