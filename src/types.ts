export interface Student {
  uid: string;
  name: string;
  email: string;
  major: string;
  school: string;
  term: string;
  qualtrics_data?: QualtricsResponse[];
  linkedin_data?: LinkedInPosition[];
  clearinghouse_data?: ClearingHouseRecord[];
  masterData?: MasterData;
}

// Raw data from database - payload contains actual data
export interface QualtricsResponse {
  id: number;
  survey_id: string;
  response_id: string;
  recorded_at: string;
  payload: Record<string, any>; // JSONB field with survey responses
  source_file: string;
}

export interface LinkedInPosition {
  id: number;
  position_key: string;
  payload: Record<string, any>; // JSONB field with LinkedIn data
  source_file: string;
}

export interface ClearingHouseRecord {
  id: number;
  record_key: string;
  payload: Record<string, any>; // JSONB field with enrollment data
  source_file: string;
}

// Legacy interfaces for backward compatibility with existing components
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
  sources: string[]; // Multiple selection: 'qualtrics', 'linkedin', 'clearinghouse'
}
