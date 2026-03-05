import type { Student, MasterData } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

interface GetStudentsParams {
  name?: string;
  major?: string;
  school?: string;
  term?: string;
  uid?: string;
  sources?: string[];
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
  async getStudents(params?: GetStudentsParams, signal?: AbortSignal): Promise<GetStudentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name);
    if (params?.major) queryParams.append('major', params.major);
    if (params?.school) queryParams.append('school', params.school);
    if (params?.term) queryParams.append('term', params.term);
    if (params?.uid) queryParams.append('uid', params.uid);
    if (params?.sources?.length) params.sources.forEach(s => queryParams.append('sources', s));
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/students${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    const data: GetStudentsResponse = await response.json();
    // Normalize null source arrays to empty arrays so demographics-only
    // students still render as valid student cards
    data.students = data.students.map((s) => ({
      ...s,
      qualtrics_data: s.qualtrics_data ?? [],
      linkedin_data: s.linkedin_data ?? [],
      clearinghouse_data: s.clearinghouse_data ?? [],
    }));
    return data;
  },

  /**
   * Fetch a single student by UID
   */
  async getStudent(uid: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${uid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    const student: Student = await response.json();
    return {
      ...student,
      qualtrics_data: student.qualtrics_data ?? [],
      linkedin_data: student.linkedin_data ?? [],
      clearinghouse_data: student.clearinghouse_data ?? [],
    };
  },

  /**
   * Save master data for a student.
   * For source-based saves (qualtrics/linkedin/clearinghouse), only term + selected_source needed.
   * For manual saves, include the outcome fields.
   */
  async saveMasterData(
    uid: string,
    data: { term: string; selectedSource: string } & Partial<MasterData>
  ): Promise<{ message: string; uid: string; data: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/students/${uid}/master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: data.term,
        selected_source: data.selectedSource,
        // Manual-entry fields (ignored for source-based saves)
        outcome_status: data.currentActivity || data.employmentStatus || undefined,
        employer_name: data.currentEmployer || undefined,
        job_title: data.currentPosition || undefined,
        continuing_education_institution: data.currentInstitution || undefined,
        military_branch: (data as Record<string, unknown>).militaryBranch || undefined,
        military_rank: (data as Record<string, unknown>).militaryRank || undefined,
      }),
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error((detail as Record<string, string>).detail || `Failed to save master data: ${response.statusText}`);
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

  /**
   * Fetch aggregated report statistics (JSON preview)
   */
  async getReportData(params: { major?: string; school?: string; term?: string }): Promise<Record<string, unknown>> {
    const q = new URLSearchParams();
    if (params.major) q.append('major', params.major);
    if (params.school) q.append('school', params.school);
    if (params.term) q.append('term', params.term);
    const url = `${API_BASE_URL}/report/data${q.toString() ? '?' + q.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch report data: ${response.statusText}`);
    return response.json();
  },

  /**
   * Fetch export records from analytics.master_graduate_outcomes
   */
  async getExportRecords(params?: { major?: string; school?: string; term?: string }): Promise<{ count: number; records: Record<string, unknown>[] }> {
    const q = new URLSearchParams();
    if (params?.major) q.append('major', params.major);
    if (params?.school) q.append('school', params.school);
    if (params?.term) q.append('term', params.term);
    const url = `${API_BASE_URL}/export${q.toString() ? '?' + q.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch export data: ${response.statusText}`);
    return response.json();
  },

  /**
   * Build the download URL for a DOCX report (returns URL string, not a fetch)
   */
  getReportDownloadUrl(params: { major?: string; school?: string; term?: string }): string {
    const q = new URLSearchParams();
    if (params.major) q.append('major', params.major);
    if (params.school) q.append('school', params.school);
    if (params.term) q.append('term', params.term);
    return `${API_BASE_URL}/report/download${q.toString() ? '?' + q.toString() : ''}`;
  },
};
