export interface Student {
  id: string;
  name: string;
  uid: string;
  major: string;
  school: string;
  term: string;
  qualtricsData?: QualtricsData;
  linkedInData?: LinkedInData;
  clearingHouseData?: ClearingHouseData;
  masterData?: MasterData;
}

export interface QualtricsData {
  id: string;
  surveyId: string;
  responses: Record<string, any>;
  sourcedTime: string;
}

export interface LinkedInData {
  id: string;
  positions: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  sourcedTime: string;
}

export interface ClearingHouseData {
  id: string;
  enrollmentRecords: Array<{
    institution: string;
    enrollmentDate: string;
    degree: string;
    major: string;
    status: string;
  }>;
  sourcedTime: string;
}

export interface MasterData {
  id: string;
  selectedSource: 'qualtrics' | 'linkedin' | 'clearinghouse' | 'manual';
  currentActivity?: string; // Primary activity: education, working, military, business, etc.
  employmentStatus: string;
  currentEmployer?: string;
  currentPosition?: string;
  enrollmentStatus?: string;
  currentInstitution?: string;
  lastUpdated: string;
}

export interface FilterValues {
  name: string;
  uid: string;
  major: string;
  school: string;
  term: string;
}
