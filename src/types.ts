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
