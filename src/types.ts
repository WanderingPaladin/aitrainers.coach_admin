export const STATUSES = ['submitted', 'booked', 'reviewed', 'advanced', 'declined'] as const;

export function formatYearsOfAiTraining(years: number): string {
  if (years <= 0) {
    return 'New to AI training';
  }
  if (years === 1) {
    return '1';
  }
  if (years === 2) {
    return '2';
  }
  if (years === 3) {
    return '3';
  }
  return '3+';
}

export type ApplicationStatus = (typeof STATUSES)[number];
export type BookingStatus = 'confirmed' | 'cancelled';

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
  location: string | null;
  timezone: string;
  path: string;
  linkedinUrl: string | null;
  background: string;
  goals: string;
  ipAddress: string | null;
  ipLocation: string | null;
  applicant_stage: 'new_no_account' | 'has_accounts_no_time' | 'working_no_progress' | null;
  referral_source: string | null;
  us_eligibility_confirmed: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  applicationId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  meetingUrl: string | null;
  createdAt: string;
  cancelledAt: string | null;
};

export type ApplicationDetail = Application & {
  bookings: Booking[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
