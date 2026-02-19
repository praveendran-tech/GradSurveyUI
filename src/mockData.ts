import type { Student } from './types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Smith',
    uid: '117123456',
    major: 'Computer Science',
    school: 'College of Computer, Mathematical, and Natural Sciences',
    term: 'Spring 2025',
    qualtricsData: {
      id: 'q1',
      surveyId: 'SV_123456',
      responses: {
        'Employment Status': 'Employed Full-Time',
        'Company Name': 'Google',
        'Job Title': 'Software Engineer',
        'Salary Range': '$100,000 - $150,000',
        'Industry': 'Technology',
      },
      sourcedTime: '2025-02-15T10:30:00Z',
    },
    linkedInData: {
      id: 'l1',
      positions: [
        {
          title: 'Software Engineer',
          company: 'Google',
          startDate: '2024-06',
          description: 'Working on search infrastructure',
        },
        {
          title: 'Software Engineering Intern',
          company: 'Microsoft',
          startDate: '2023-06',
          endDate: '2023-08',
          description: 'Developed features for Azure',
        },
      ],
      education: [
        {
          school: 'University of Maryland',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
      sourcedTime: '2025-02-16T14:20:00Z',
    },
    masterData: {
      id: 'm1',
      selectedSource: 'linkedin',
      employmentStatus: 'employed',
      currentEmployer: 'Google',
      currentPosition: 'Software Engineer',
      lastUpdated: '2025-02-17T09:00:00Z',
    },
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    uid: '117234567',
    major: 'Business Administration',
    school: 'Robert H. Smith School of Business',
    term: 'Fall 2024',
    qualtricsData: {
      id: 'q2',
      surveyId: 'SV_123456',
      responses: {
        'Employment Status': 'Pursuing Graduate Degree',
        'Graduate School': 'Harvard Business School',
        'Degree Program': 'MBA',
        'Expected Graduation': '2026',
      },
      sourcedTime: '2025-02-10T11:45:00Z',
    },
    clearingHouseData: {
      id: 'c1',
      enrollmentRecords: [
        {
          institution: 'Harvard University',
          enrollmentDate: '2024-09-01',
          degree: 'MBA',
          major: 'Business Administration',
          status: 'Currently Enrolled',
        },
      ],
      sourcedTime: '2025-02-12T08:30:00Z',
    },
  },
  {
    id: '3',
    name: 'Michael Chen',
    uid: '117345678',
    major: 'Mechanical Engineering',
    school: 'A. James Clark School of Engineering',
    term: 'Spring 2025',
    linkedInData: {
      id: 'l2',
      positions: [
        {
          title: 'Mechanical Engineer',
          company: 'Tesla',
          startDate: '2024-08',
          description: 'Design and testing of automotive components',
        },
      ],
      education: [
        {
          school: 'University of Maryland',
          degree: 'Bachelor of Science',
          field: 'Mechanical Engineering',
          startDate: '2020',
          endDate: '2024',
        },
      ],
      sourcedTime: '2025-02-14T16:00:00Z',
    },
    clearingHouseData: {
      id: 'c2',
      enrollmentRecords: [
        {
          institution: 'University of Maryland',
          enrollmentDate: '2020-09-01',
          degree: 'Bachelor of Science',
          major: 'Mechanical Engineering',
          status: 'Graduated',
        },
      ],
      sourcedTime: '2025-02-13T12:15:00Z',
    },
    masterData: {
      id: 'm2',
      selectedSource: 'linkedin',
      employmentStatus: 'employed',
      currentEmployer: 'Tesla',
      currentPosition: 'Mechanical Engineer',
      lastUpdated: '2025-02-15T10:30:00Z',
    },
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    uid: '117456789',
    major: 'Psychology',
    school: 'College of Behavioral and Social Sciences',
    term: 'Fall 2024',
    qualtricsData: {
      id: 'q3',
      surveyId: 'SV_123456',
      responses: {
        'Employment Status': 'Seeking Employment',
        'Job Search Status': 'Actively Applying',
        'Preferred Industry': 'Healthcare',
        'Preferred Role': 'Clinical Research Coordinator',
      },
      sourcedTime: '2025-02-18T09:20:00Z',
    },
  },
  {
    id: '5',
    name: 'David Kim',
    uid: '117567890',
    major: 'Economics',
    school: 'College of Behavioral and Social Sciences',
    term: 'Spring 2025',
  },
];
