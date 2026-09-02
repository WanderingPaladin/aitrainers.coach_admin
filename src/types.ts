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

export type Booking = {
  id: string;
  applicationId: string;
  startsAt: string;
  endsAt: string;
  status: 'confirmed' | 'cancelled';
  meetingUrl: string | null;
  createdAt: string;
  cancelledAt: string | null;
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
