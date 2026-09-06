import { request } from './http';
import type {
  Application,
  ApplicationFilters,
  ApplicationNote,
  AvailabilityRule,
  Booking,
  FilterOptions,
  ListResponse,
  OverviewResponse,
  PipelineStage,
} from '../types';

function toQuery(filters: ApplicationFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.stage?.length) params.set('stage', filters.stage.join(','));
  if (filters.applicantStage?.length) params.set('applicantStage', filters.applicantStage.join(','));
  if (filters.profession) params.set('profession', filters.profession);
  if (filters.experienceMin != null) params.set('experienceMin', String(filters.experienceMin));
  if (filters.experienceMax != null) params.set('experienceMax', String(filters.experienceMax));
  if (filters.state) params.set('state', filters.state);
  if (filters.assignee) params.set('assignee', filters.assignee);
  if (filters.unassigned) params.set('unassigned', 'true');
  if (filters.submittedFrom) params.set('submittedFrom', filters.submittedFrom);
  if (filters.submittedTo) params.set('submittedTo', filters.submittedTo);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.ids?.length) params.set('ids', filters.ids.join(','));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function login(password: string) {
  return request<{ admin: { name: string } }>('/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request<{ ok: boolean }>('/v1/admin/logout', { method: 'POST' });
}

export function getMe() {
  return request<{ admin: { name: string } }>('/v1/admin/me');
}

export function getOverview() {
  return request<OverviewResponse>('/v1/admin/overview');
}

export function listApplications(filters: ApplicationFilters) {
  return request<ListResponse<Application>>(`/v1/admin/applications${toQuery(filters)}`);
}

export function getApplication(id: string) {
  return request<{ application: Application }>(`/v1/admin/applications/${id}`);
}

export function patchApplication(
  id: string,
  body: {
    pipelineStage?: PipelineStage;
    assignee?: string | null;
    tags?: string[];
    addTag?: string;
    nextActionAt?: string | null;
    demoScheduledAt?: string | null;
  },
) {
  return request<{ application: Application }>(`/v1/admin/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function addNote(id: string, body: string) {
  return request<{ note: ApplicationNote }>(`/v1/admin/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export function bulkUpdate(body: {
  ids: string[];
  pipelineStage?: PipelineStage;
  assignee?: string | null;
  addTag?: string;
  archive?: boolean;
}) {
  return request<{ updated: number }>('/v1/admin/applications/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function exportCsv(filters: ApplicationFilters) {
  return request<string>(`/v1/admin/applications.csv${toQuery(filters)}`);
}

export function getFilterOptions() {
  return request<FilterOptions>('/v1/admin/applications/options');
}

export function listBookings(params?: { status?: string; page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  const query = search.toString();
  return request<ListResponse<Booking>>(`/v1/admin/bookings${query ? `?${query}` : ''}`);
}

export function cancelBooking(id: string) {
  return request<{ booking: Booking }>(`/v1/admin/bookings/${id}/cancel`, { method: 'POST' });
}

export function listAvailability() {
  return request<{ rules: AvailabilityRule[] }>('/v1/admin/availability');
}

export function createAvailability(body: Omit<AvailabilityRule, 'id'>) {
  return request<{ rule: AvailabilityRule }>('/v1/admin/availability', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patchAvailability(id: string, body: Partial<Omit<AvailabilityRule, 'id'>>) {
  return request<{ rule: AvailabilityRule }>(`/v1/admin/availability/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAvailability(id: string) {
  return request<void>(`/v1/admin/availability/${id}`, { method: 'DELETE' });
}

export function listJobSources() {
  return request<{ sources: import('../types').JobSource[]; identifierHelp: Record<string, string> }>(
    '/v1/admin/job-sources',
  );
}

export function createJobSource(body: {
  companyName: string;
  companySlug?: string;
  companyLogoUrl?: string | null;
  sourceType: import('../types').JobSourceType;
  boardToken?: string;
  careersUrl?: string;
  enabled?: boolean;
  priority?: number;
}) {
  return request<{ source: import('../types').JobSource }>('/v1/admin/job-sources', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patchJobSource(id: string, body: Record<string, unknown>) {
  return request<{ source: import('../types').JobSource }>(`/v1/admin/job-sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function discoverJobSources() {
  return request<{
    discovery: {
      queries: number;
      urlsSeen: number;
      boardsFound: number;
      sourcesCreated: number;
      sourcesUpdated: number;
      sourcesSkipped: number;
      seedOpportunitiesClosed: number;
      seedOpportunitiesReopened?: number;
    };
    sync: { locked: boolean; staleMarked: number; results: unknown[] };
  }>('/v1/admin/job-sources/discover', { method: 'POST' });
}

export function syncJobSource(id: string) {
  return request<{
    locked: boolean;
    staleMarked: number;
    results: Array<{
      sourceId: string;
      status: string;
      jobsFetched: number;
      jobsInserted: number;
      jobsUpdated: number;
      jobsRejected: number;
      errorMessage: string | null;
    }>;
  }>(`/v1/admin/job-sources/${id}/sync`, { method: 'POST' });
}

export function listAdminJobs(params?: { q?: string; visibility?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.visibility) search.set('visibility', params.visibility);
  if (params?.page) search.set('page', String(params.page));
  const query = search.toString();
  return request<import('../types').ListResponse<import('../types').AdminJob> & { items: import('../types').AdminJob[] }>(
    `/v1/admin/jobs${query ? `?${query}` : ''}`,
  );
}

export function patchAdminJob(id: string, isActive: boolean) {
  return request<{ job: { id: string; isActive: boolean; visibility: string; relevanceScore: number } }>(
    `/v1/admin/jobs/${id}`,
    { method: 'PATCH', body: JSON.stringify({ isActive }) },
  );
}

export function listFeedback(params?: { status?: string; category?: string; q?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.category) search.set('category', params.category);
  if (params?.q) search.set('q', params.q);
  if (params?.page) search.set('page', String(params.page));
  const query = search.toString();
  return request<import('../types').ListResponse<import('../types').SiteFeedback> & { newCount: number }>(
    `/v1/admin/feedback${query ? `?${query}` : ''}`,
  );
}

export function patchFeedback(id: string, status: import('../types').FeedbackStatus) {
  return request<{ feedback: import('../types').SiteFeedback }>(`/v1/admin/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getFunnelAnalytics(params: { range?: string; from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params.range) search.set('range', params.range);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return request<import('../types').FunnelResponse>(`/v1/admin/analytics/funnel${query ? `?${query}` : ''}`);
}

export function patchIntroCallAttendance(id: string, attendance: import('../types').IntroCallAttendance) {
  return request<{ booking: Booking }>(`/v1/admin/bookings/${id}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({ attendance }),
  });
}

export function upsertPlatformProgress(
  applicationId: string,
  body: {
    platform: string;
    opportunityId?: string;
    opportunityTitle?: string;
    status: import('../types').PlatformProgressStatus;
    occurredAt?: string;
    notes?: string;
  },
) {
  return request<{
    platform: import('../types').PlatformProgress;
    platforms: import('../types').PlatformProgress[];
    events: import('../types').JourneyEvent[];
    application: Application;
  }>(`/v1/admin/applications/${applicationId}/platforms`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function downloadCsvFile(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
