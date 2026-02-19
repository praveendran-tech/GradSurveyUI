import { useState, useMemo, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import { Header } from '../components/Header';
import { FilterBar } from '../components/FilterBar';
import { StudentList } from '../components/StudentList';
import { EmptyState } from '../components/EmptyState';
import { StartFilteringState } from '../components/StartFilteringState';
import type { FilterValues, Student, MasterData } from '../types';
import { api } from '../api';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<FilterValues>({
    name: '',
    uid: '',
    major: '',
    school: '',
    term: '',
    sources: [],
  });

  const PAGE_SIZE = 50;

  // Fetch students from API on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getStudents({ limit: PAGE_SIZE, offset: 0 });
        setStudents(data.students);
        setHasMore(data.has_more || false);
        setTotalCount(data.total || data.count);
        setOffset(PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Load more students
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const data = await api.getStudents({ limit: PAGE_SIZE, offset });
      setStudents((prev) => [...prev, ...data.students]);
      setHasMore(data.has_more || false);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (err) {
      console.error('Error loading more students:', err);
      alert('Failed to load more students. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

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

      // Source filtering: if sources are selected, student must have data from at least one selected source
      const matchesSources = filters.sources.length === 0 || filters.sources.some(source => {
        if (source === 'qualtrics') {
          return student.qualtrics_data && student.qualtrics_data.length > 0;
        }
        if (source === 'linkedin') {
          return student.linkedin_data && student.linkedin_data.length > 0;
        }
        if (source === 'clearinghouse') {
          return student.clearinghouse_data && student.clearinghouse_data.length > 0;
        }
        return false;
      });

      return matchesName && matchesUid && matchesMajor && matchesSchool && matchesTerm && matchesSources;
    });
  }, [students, filters]);

  const handleSelectSource = async (
    studentUid: string,
    source: 'qualtrics' | 'linkedin' | 'clearinghouse'
  ) => {
    try {
      const student = students.find(s => s.uid === studentUid);
      if (!student) return;

      let masterData: Partial<MasterData> = {
        selectedSource: source,
      };

      // Extract data from the selected source
      if (source === 'qualtrics' && student.qualtrics_data && student.qualtrics_data.length > 0) {
        const payload = student.qualtrics_data[0].payload;
        masterData = {
          selectedSource: 'qualtrics',
          employmentStatus: payload['Employment Status'] || '',
          currentEmployer: payload['Company Name'] || payload['Graduate School'] || '',
          currentPosition: payload['Job Title'] || payload['Degree Program'] || '',
          enrollmentStatus: payload['Employment Status']?.includes('Graduate') ? 'enrolled' : '',
          currentInstitution: payload['Graduate School'] || '',
        };
      } else if (source === 'linkedin' && student.linkedin_data && student.linkedin_data.length > 0) {
        const payload = student.linkedin_data[0].payload;
        masterData = {
          selectedSource: 'linkedin',
          employmentStatus: 'employed',
          currentEmployer: payload['company'] || '',
          currentPosition: payload['title'] || '',
        };
      } else if (source === 'clearinghouse' && student.clearinghouse_data && student.clearinghouse_data.length > 0) {
        const payload = student.clearinghouse_data[0].payload;
        masterData = {
          selectedSource: 'clearinghouse',
          employmentStatus: '',
          enrollmentStatus: payload['status'] || '',
          currentInstitution: payload['institution'] || '',
        };
      }

      // Save to backend
      await api.saveMasterData(studentUid, masterData);

      // Update local state
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid === studentUid) {
            return {
              ...s,
              masterData: {
                id: `m_${studentUid}`,
                ...masterData,
                selectedSource: source,
                employmentStatus: masterData.employmentStatus || '',
                lastUpdated: new Date().toISOString(),
              } as MasterData,
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Error saving master data:', err);
      alert('Failed to save master data. Please try again.');
    }
  };

  const handleAddManual = async (studentUid: string, data: Partial<MasterData>) => {
    try {
      await api.saveMasterData(studentUid, data);

      setStudents((prev) =>
        prev.map((student) => {
          if (student.uid === studentUid) {
            return {
              ...student,
              masterData: {
                id: `m_${studentUid}`,
                selectedSource: 'manual',
                employmentStatus: data.employmentStatus || '',
                currentEmployer: data.currentEmployer,
                currentPosition: data.currentPosition,
                enrollmentStatus: data.enrollmentStatus,
                currentInstitution: data.currentInstitution,
                currentActivity: data.currentActivity,
                lastUpdated: new Date().toISOString(),
              },
            };
          }
          return student;
        })
      );
    } catch (err) {
      console.error('Error saving manual data:', err);
      alert('Failed to save manual data. Please try again.');
    }
  };

  const handleEditMaster = async (studentUid: string, data: Partial<MasterData>) => {
    try {
      await api.saveMasterData(studentUid, data);

      setStudents((prev) =>
        prev.map((student) => {
          if (student.uid === studentUid && student.masterData) {
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
    } catch (err) {
      console.error('Error updating master data:', err);
      alert('Failed to update master data. Please try again.');
    }
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      uid: '',
      major: '',
      school: '',
      term: '',
      sources: [],
    });
  };

  const hasActiveFilters = filters.name !== '' ||
                          filters.uid !== '' ||
                          filters.major !== '' ||
                          filters.school !== '' ||
                          filters.term !== '' ||
                          filters.sources.length > 0;
  const studentsWithMasterData = filteredStudents.filter((s) => s.masterData).length;

  return (
    <>
      <Header />

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f5f5f5 100%)',
          }}
        >
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: '#E21833', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading student data...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f5f5f5 100%)',
          }}
        >
          <Container maxWidth="sm">
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                color: 'white',
              }}
            >
              Retry
            </Button>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      {!loading && !error && (
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
                  label={`${students.length} of ${totalCount} Students Loaded`}
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
                <>
                  <StudentList
                    students={filteredStudents}
                    onSelectSource={handleSelectSource}
                    onAddManual={handleAddManual}
                    onEditMaster={handleEditMaster}
                  />

                  {/* Load More Button */}
                  {!hasActiveFilters && hasMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={loadMore}
                        disabled={loadingMore}
                        sx={{
                          background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                          color: 'white',
                          px: 6,
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 3,
                          boxShadow: '0 4px 12px rgba(226, 24, 51, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #C41230 0%, #A01028 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(226, 24, 51, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loadingMore ? (
                          <>
                            <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                            Loading...
                          </>
                        ) : (
                          `Load More (${students.length} of ${totalCount})`
                        )}
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <EmptyState onReset={resetFilters} />
              )}
            </Box>
          </Fade>
        </Container>
      </Box>
      )}
    </>
  );
};
