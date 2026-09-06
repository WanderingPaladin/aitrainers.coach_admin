import type {
  ApplicantStage,
  IntroCallAttendance,
  JourneyStage,
  PipelineStage,
  PlatformProgressStatus,
} from '../types';

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

export const JOURNEY_LABELS: Record<JourneyStage, string> = {
  visitor: 'Visitor',
  application_started: 'Applying',
  application_submitted: 'Applied',
  intro_call_booked: 'Call Booked',
  intro_call_attended: 'Call Attended',
  coaching_started: 'Coaching',
  platform_applied: 'Applied',
  platform_assessment: 'Assessment',
  platform_interview: 'Interview',
  platform_interview_passed: 'Passed',
  project_started: 'Working',
  inactive: 'Inactive',
};

export const ATTENDANCE_LABELS: Record<IntroCallAttendance, string> = {
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled',
  attended: 'Attended',
  no_show: 'No-show',
  completed: 'Completed',
};

export const PLATFORM_STATUS_LABELS: Record<PlatformProgressStatus, string> = {
  interested: 'Interested',
  applied: 'Applied',
  assessment_invited: 'Assessment invited',
  assessment_started: 'Assessment started',
  assessment_completed: 'Assessment completed',
  interview_invited: 'Interview invited',
  interview_scheduled: 'Interview scheduled',
  interview_completed: 'Interview completed',
  passed: 'Passed',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  project_received: 'Project received',
  working: 'Working',
  inactive: 'Inactive',
};

export const JOURNEY_EVENT_LABELS: Record<string, string> = {
  site_visited: 'Visited AI Trainers',
  page_view: 'Viewed a page',
  hero_cta_clicked: 'Clicked intro-call CTA',
  application_started: 'Application started',
  application_stage_selected: 'Application situation selected',
  application_submitted: 'Application submitted',
  booking_started: 'Started booking an intro call',
  booking_date_selected: 'Selected an intro-call date',
  booking_time_selected: 'Selected an intro-call time',
  booking_confirmed: 'Intro call booked',
  intro_call_rescheduled: 'Intro call rescheduled',
  intro_call_cancelled: 'Intro call cancelled',
  intro_call_attended: 'Intro call attended',
  intro_call_no_show: 'Intro call no-show',
  profile_created: 'Profile created',
  profile_completed: 'Profile completed',
  opportunity_viewed: 'Viewed an opportunity',
  opportunity_saved: 'Saved an opportunity',
  opportunity_external_clicked: 'Opened an external opportunity',
  feedback_submitted: 'Submitted feedback',
  platform_application_added: 'Applied to a platform',
  platform_assessment_invited: 'Platform assessment invited',
  platform_assessment_started: 'Platform assessment started',
  platform_assessment_completed: 'Platform assessment completed',
  platform_interview_invited: 'Platform interview invited',
  platform_interview_scheduled: 'Platform interview scheduled',
  platform_interview_completed: 'Platform interview completed',
  platform_interview_passed: 'Passed platform interview',
  platform_interview_rejected: 'Platform interview rejected',
  platform_project_started: 'Project started',
  platform_project_ended: 'Project ended',
  candidate_inactive: 'Marked inactive',
};

export const PLATFORM_STATUSES = [
  'interested',
  'applied',
  'assessment_invited',
  'assessment_started',
  'assessment_completed',
  'interview_invited',
  'interview_scheduled',
  'interview_completed',
  'passed',
  'rejected',
  'waitlisted',
  'project_received',
  'working',
  'inactive',
] as const;

export function sourceLabel(source: string | null | undefined): string {
  if (!source) return 'Unknown';
  const labels: Record<string, string> = {
    google: 'Google',
    reddit: 'Reddit',
    discord: 'Discord',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    facebook: 'Facebook',
    youtube: 'YouTube',
    direct: 'Direct',
    referral: 'Referral',
    other: 'Other',
    unknown: 'Unknown',
  };
  return labels[source] ?? source.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

export function parseIpLocation(value: string | null | undefined): {
  ip: string | null;
  label: string | null;
} {
  if (!value) {
    return { ip: null, label: null };
  }
  try {
    const parsed = JSON.parse(value) as {
      ip?: string | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
      label?: string | null;
    };
    const label =
      parsed.label?.trim() ||
      [parsed.city, parsed.region, parsed.country].filter(Boolean).join(', ') ||
      null;
    return { ip: parsed.ip ?? null, label };
  } catch {
    return { ip: null, label: value };
  }
}

export function formatIpAddress(application: {
  ipAddress?: string | null;
  ipLocation?: string | null;
}): string {
  return application.ipAddress || parseIpLocation(application.ipLocation).ip || '—';
}

export function formatIpPlace(application: { ipLocation?: string | null }): string {
  return parseIpLocation(application.ipLocation).label || '—';
}

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
