import type { Student, MasterData } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

interface GetStudentsParams {
  name?: string;
  major?: string;
  school?: string;
  term?: string;
  limit?: number;
  offset?: number;
}

interface GetStudentsResponse {
  count: number;
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
  students: Student[];
}

export const api = {
  /**
   * Fetch students with optional filters and pagination
   */
  async getStudents(params?: GetStudentsParams): Promise<GetStudentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name);
    if (params?.major) queryParams.append('major', params.major);
    if (params?.school) queryParams.append('school', params.school);
    if (params?.term) queryParams.append('term', params.term);
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/students${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Fetch a single student by UID
   */
  async getStudent(uid: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${uid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Save master data for a student
   */
  async saveMasterData(uid: string, data: Partial<MasterData>): Promise<{ message: string; uid: string }> {
    const response = await fetch(`${API_BASE_URL}/students/${uid}/master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_source: data.selectedSource,
        current_activity: data.currentActivity,
        employment_status: data.employmentStatus,
        current_employer: data.currentEmployer,
        current_position: data.currentPosition,
        enrollment_status: data.enrollmentStatus,
        current_institution: data.currentInstitution,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save master data: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get unique majors for filter dropdown
   */
  async getMajors(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/filters/majors`);

    if (!response.ok) {
      throw new Error(`Failed to fetch majors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.majors;
  },

  /**
   * Get unique schools for filter dropdown
   */
  async getSchools(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/filters/schools`);

    if (!response.ok) {
      throw new Error(`Failed to fetch schools: ${response.statusText}`);
    }

    const data = await response.json();
    return data.schools;
  },

  /**
   * Get unique terms for filter dropdown
   */
  async getTerms(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/filters/terms`);

    if (!response.ok) {
      throw new Error(`Failed to fetch terms: ${response.statusText}`);
    }

    const data = await response.json();
    return data.terms;
  },
};
