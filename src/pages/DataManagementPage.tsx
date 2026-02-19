import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Fade,
  Zoom,
  keyframes,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import { Header } from '../components/Header';
import { FilterBar } from '../components/FilterBar';
import { StudentList } from '../components/StudentList';
import { EmptyState } from '../components/EmptyState';
import { StartFilteringState } from '../components/StartFilteringState';
import type { FilterValues, Student, MasterData } from '../types';
import { mockStudents } from '../mockData';

// Keyframe animations
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const DataManagementPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [filters, setFilters] = useState<FilterValues>({
    name: '',
    uid: '',
    major: '',
    school: '',
    term: '',
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesName = !filters.name ||
        student.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesUid = !filters.uid ||
        student.uid.includes(filters.uid);
      const matchesMajor = !filters.major ||
        student.major.toLowerCase().includes(filters.major.toLowerCase());
      const matchesSchool = !filters.school ||
        student.school.toLowerCase().includes(filters.school.toLowerCase());
      const matchesTerm = !filters.term ||
        student.term.toLowerCase().includes(filters.term.toLowerCase());

      return matchesName && matchesUid && matchesMajor && matchesSchool && matchesTerm;
    });
  }, [students, filters]);

  const handleSelectSource = (
    studentId: string,
    source: 'qualtrics' | 'linkedin' | 'clearinghouse'
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          let masterData: MasterData;

          if (source === 'qualtrics' && student.qualtricsData) {
            const responses = student.qualtricsData.responses;
            masterData = {
              id: `m_${studentId}`,
              selectedSource: 'qualtrics',
              employmentStatus: responses['Employment Status'] || '',
              currentEmployer: responses['Company Name'] || responses['Graduate School'] || '',
              currentPosition: responses['Job Title'] || responses['Degree Program'] || '',
              enrollmentStatus: responses['Employment Status']?.includes('Graduate') ? 'enrolled' : '',
              currentInstitution: responses['Graduate School'] || '',
              lastUpdated: new Date().toISOString(),
            };
          } else if (source === 'linkedin' && student.linkedInData) {
            const latestPosition = student.linkedInData.positions[0];
            masterData = {
              id: `m_${studentId}`,
              selectedSource: 'linkedin',
              employmentStatus: 'employed',
              currentEmployer: latestPosition.company,
              currentPosition: latestPosition.title,
              lastUpdated: new Date().toISOString(),
            };
          } else if (source === 'clearinghouse' && student.clearingHouseData) {
            const latestRecord = student.clearingHouseData.enrollmentRecords[0];
            masterData = {
              id: `m_${studentId}`,
              selectedSource: 'clearinghouse',
              employmentStatus: '',
              enrollmentStatus: latestRecord.status,
              currentInstitution: latestRecord.institution,
              lastUpdated: new Date().toISOString(),
            };
          } else {
            return student;
          }

          return {
            ...student,
            masterData,
          };
        }
        return student;
      })
    );
  };

  const handleAddManual = (studentId: string, data: Partial<MasterData>) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            masterData: {
              id: `m_${studentId}`,
              selectedSource: 'manual',
              employmentStatus: data.employmentStatus || '',
              currentEmployer: data.currentEmployer,
              currentPosition: data.currentPosition,
              enrollmentStatus: data.enrollmentStatus,
              currentInstitution: data.currentInstitution,
              lastUpdated: new Date().toISOString(),
            },
          };
        }
        return student;
      })
    );
  };

  const handleEditMaster = (studentId: string, data: Partial<MasterData>) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId && student.masterData) {
          return {
            ...student,
            masterData: {
              ...student.masterData,
              ...data,
              lastUpdated: new Date().toISOString(),
            },
          };
        }
        return student;
      })
    );
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      uid: '',
      major: '',
      school: '',
      term: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');
  const studentsWithMasterData = filteredStudents.filter((s) => s.masterData).length;

  return (
    <>
      <Header />

      {/* Animated Background Pattern */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f5f5f5 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 50px,
                rgba(226, 24, 51, 0.02) 50px,
                rgba(226, 24, 51, 0.02) 100px
              )
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Premium Header Section */}
          <Fade in timeout={800}>
            <Box
              sx={{
                mb: 4,
                p: 4,
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.08) 0%, rgba(255, 210, 0, 0.08) 100%)',
                borderRadius: 4,
                border: '2px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                animation: `${fadeInUp} 0.8s ease-out`,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(90deg, #E21833, #FFD200, #E21833)',
                  backgroundSize: '200% 100%',
                  animation: `${shimmer} 3s linear infinite`,
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(226, 24, 51, 0.3)',
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(135deg, #E21833 0%, #FFD200 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      mb: 0.5,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    Student Data Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Comprehensive graduate outcomes tracking and management system
                  </Typography>
                </Box>
              </Box>

              {/* Stats Row */}
              <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                mt={3}
                sx={{ animation: `${slideInRight} 1s ease-out 0.3s both` }}
              >
                <Chip
                  icon={<PeopleIcon />}
                  label={`${students.length} Total Students`}
                  sx={{
                    background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 1,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  }}
                />
                {hasActiveFilters && (
                  <Chip
                    icon={<FilterListIcon />}
                    label={`${filteredStudents.length} Filtered Results`}
                    sx={{
                      background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      boxShadow: '0 4px 12px rgba(226, 24, 51, 0.3)',
                    }}
                  />
                )}
                {hasActiveFilters && (
                  <Chip
                    label={`${studentsWithMasterData} In Master DB`}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    }}
                  />
                )}
                {hasActiveFilters && (
                  <Chip
                    label="Filters Active"
                    onDelete={resetFilters}
                    sx={{
                      background: 'linear-gradient(135deg, #FFD200 0%, #FFC107 100%)',
                      color: '#000',
                      fontWeight: 600,
                      px: 1,
                      boxShadow: '0 4px 12px rgba(255, 210, 0, 0.3)',
                    }}
                  />
                )}
              </Box>
            </Box>
          </Fade>

          {/* Enhanced Filter Bar */}
          <Zoom in timeout={1000}>
            <Box sx={{ animation: `${fadeInUp} 1s ease-out 0.3s both` }}>
              <FilterBar filters={filters} onFilterChange={setFilters} />
            </Box>
          </Zoom>

          {/* Student List Section */}
          <Fade in timeout={1200}>
            <Box mt={4} sx={{ animation: `${fadeInUp} 1.2s ease-out 0.5s both` }}>
              {!hasActiveFilters ? (
                <StartFilteringState />
              ) : filteredStudents.length > 0 ? (
                <StudentList
                  students={filteredStudents}
                  onSelectSource={handleSelectSource}
                  onAddManual={handleAddManual}
                  onEditMaster={handleEditMaster}
                />
              ) : (
                <EmptyState onReset={resetFilters} />
              )}
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
};
