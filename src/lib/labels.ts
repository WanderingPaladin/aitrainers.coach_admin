import type { ApplicantStage, PipelineStage } from '../types';

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  CONTACTED: 'Contacted',
  DEMO_SCHEDULED: 'Demo',
  QUALIFIED: 'Qualified',
  ONBOARDING: 'Onboarding',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

export const PIPELINE_HINTS: Record<PipelineStage, string> = {
  NEW: 'Not yet reviewed',
  REVIEWING: 'In review',
  CONTACTED: 'Outreach sent',
  DEMO_SCHEDULED: 'Intro call booked',
  QUALIFIED: 'Ready to join',
  ONBOARDING: 'Being onboarded',
  REJECTED: 'Not moving forward',
  ARCHIVED: 'Closed',
};

export const SITUATION_LABELS: Record<ApplicantStage, string> = {
  new_no_account: 'Wants to get started',
  has_accounts_no_time: 'Has account, needs support',
  working_no_progress: 'Working, not progressing',
};

export const PROFESSIONS = [
  'Software',
  'Finance',
  'Writing',
  'Science',
  'Legal',
  'Education',
  'Healthcare',
  'Research',
  'Marketing',
  'Other',
] as const;

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase() || '?';
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function relativeTime(value: string): string {
  const date = new Date(value);
  const delta = Date.now() - date.getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 14) {
    return `${days}d ago`;
  }
  return formatDate(value);
}

export function attentionReason(application: {
  pipelineStage: PipelineStage;
  createdAt: string;
  nextActionAt: string | null;
  demoScheduledAt: string | null;
}): string {
  const now = Date.now();
  if (application.pipelineStage === 'NEW' && now - new Date(application.createdAt).getTime() > 24 * 60 * 60 * 1000) {
    return 'New for over 24 hours';
  }
  if (application.pipelineStage === 'CONTACTED' && !application.nextActionAt) {
    return 'Contacted with no follow-up date';
  }
  if (
    application.pipelineStage === 'DEMO_SCHEDULED' &&
    application.demoScheduledAt &&
    new Date(application.demoScheduledAt).getTime() < now
  ) {
    return 'Past demo with no recorded outcome';
  }
  return 'Needs attention';
}
