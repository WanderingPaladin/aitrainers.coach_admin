export const PIPELINE_STAGES = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'QUALIFIED',
  'ONBOARDING',
  'REJECTED',
  'ARCHIVED',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type ApplicantStage = 'new_no_account' | 'has_accounts_no_time' | 'working_no_progress';

export type ApplicationNote = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type ApplicationActivity = {
  id: string;
  type: string;
  actor: string;
  message: string;
  metadata: unknown;
  createdAt: string;
};

export type IntroCallAttendance =
  | 'scheduled'
  | 'rescheduled'
  | 'cancelled'
  | 'attended'
  | 'no_show'
  | 'completed';

export type JourneyStage =
  | 'visitor'
  | 'application_started'
  | 'application_submitted'
  | 'intro_call_booked'
  | 'intro_call_attended'
  | 'coaching_started'
  | 'platform_applied'
  | 'platform_assessment'
  | 'platform_interview'
  | 'platform_interview_passed'
  | 'project_started'
  | 'inactive';

export type PlatformProgressStatus =
  | 'interested'
  | 'applied'
  | 'assessment_invited'
  | 'assessment_started'
  | 'assessment_completed'
  | 'interview_invited'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'passed'
  | 'rejected'
  | 'waitlisted'
  | 'project_received'
  | 'working'
  | 'inactive';

export type JourneyEvent = {
  id: string;
  eventType: string;
  platform: string | null;
  opportunityId: string | null;
  metadata: unknown;
  pagePath: string | null;
  createdBy: string;
  createdAt: string;
};

export type PlatformProgress = {
  id: string;
  platform: string;
  opportunityId: string | null;
  opportunityTitle: string | null;
  status: PlatformProgressStatus | string;
  appliedAt: string | null;
  assessmentAt: string | null;
  interviewAt: string | null;
  resultAt: string | null;
  projectStartedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
};

export type FunnelConversion = {
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  fromCount: number;
  toCount: number;
  dropped: number;
  conversion: number | null;
};

export type SourceRow = {
  source: string;
  label: string;
  visitors: number;
  applications: number;
  bookings: number;
  attended: number;
  interviews: number;
  passed: number;
  projects: number;
  visitorToApplication: number | null;
  applicationToBooking: number | null;
  interviewToPass: number | null;
};

export type FunnelResponse = {
  range: {
    preset: string;
    from: string | null;
    to: string;
    label: string;
    cohort: string;
  };
  trackingStartedAt: string | null;
  stages: FunnelStage[];
  conversions: FunnelConversion[];
  biggestDropOff: FunnelConversion | null;
  sources: SourceRow[];
};

export type Booking = {
  id: string;
  applicationId: string;
  startsAt: string;
  endsAt: string;
  status: 'confirmed' | 'cancelled';
  meetingUrl: string | null;
  createdAt: string;
  cancelledAt: string | null;
  attendance?: IntroCallAttendance;
  application?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    status: string;
    pipelineStage?: PipelineStage;
  };
};

export type Application = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  yearsOfExperience: number;
  experienceLabel: string;
  location: string | null;
  timezone: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  background: string;
  goals: string;
  interestReason: string;
  applicant_stage: ApplicantStage | null;
  candidateSituation: string | null;
  referral_source: string | null;
  us_eligibility_confirmed: boolean;
  status: string;
  pipelineStage: PipelineStage;
  assignee: string | null;
  tags: string[];
  nextActionAt: string | null;
  demoScheduledAt: string | null;
  ipAddress?: string | null;
  ipLocation?: string | null;
  visitorId?: string | null;
  journeyStage?: JourneyStage;
  firstSource?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  lastActivityAt?: string | null;
  introCall?: {
    id: string;
    status: string;
    attendance: IntroCallAttendance | string;
    startsAt: string;
  } | null;
  platformProgressSummary?: string | null;
  visitor?: {
    firstSource: string;
    firstSeenAt: string;
    landingPage: string;
    referrer: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
  } | null;
  journeyEvents?: JourneyEvent[];
  platformProgress?: PlatformProgress[];
  resume: { fileName: string; contentType: string } | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  notes?: ApplicationNote[];
  activities?: ApplicationActivity[];
  bookings?: Booking[];
  previousId?: string | null;
  nextId?: string | null;
};

export type AvailabilityRule = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
  slotMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
};

export type OverviewResponse = {
  kpis: {
    newThisWeek: number;
    needsReview: number;
    demoScheduled: number;
    qualifiedOnboarding: number;
  };
  pipeline: Record<PipelineStage, number>;
  needsAttention: Application[];
  recent: Application[];
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApplicationFilters = {
  q?: string;
  stage?: PipelineStage[];
  applicantStage?: ApplicantStage[];
  profession?: string;
  experienceMin?: number;
  experienceMax?: number;
  state?: string;
  assignee?: string;
  unassigned?: boolean;
  submittedFrom?: string;
  submittedTo?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest';
  ids?: string[];
};

export type FilterOptions = {
  assignees: string[];
  states: string[];
  tags: string[];
};

export const JOB_SOURCE_TYPES = ['greenhouse', 'lever', 'ashby', 'jsonld', 'custom'] as const;
export type JobSourceType = (typeof JOB_SOURCE_TYPES)[number];

export type JobSource = {
  id: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  sourceType: JobSourceType;
  boardToken: string;
  careersUrl: string;
  enabled: boolean;
  priority: number;
  crawlFrequencyMinutes: number;
  lastCrawledAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  jobCount: number;
  lastRun: {
    status: string;
    finishedAt: string | null;
    jobsFetched: number;
    errorMessage: string | null;
  } | null;
};

export type AdminJob = {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  location: string | null;
  remoteType: string | null;
  employmentType: string | null;
  category: string | null;
  relevanceScore: number;
  visibility: 'published' | 'review' | 'hidden';
  isActive: boolean;
  isDuplicate: boolean;
  postedAt: string | null;
  lastSeenAt: string;
  applyUrl: string;
  sourceType: JobSourceType;
  sourceName: string;
};

export const FEEDBACK_STATUSES = ['new', 'reviewed', 'planned', 'resolved', 'archived'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_CATEGORIES = ['confusing', 'improvement', 'problem', 'general', 'question'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type SiteFeedback = {
  id: string;
  category: FeedbackCategory | string;
  subcategory: string | null;
  message: string;
  rating: number | null;
  pagePath: string;
  pageUrl: string;
  userId: string | null;
  email: string | null;
  browser: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  referrer: string | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};
