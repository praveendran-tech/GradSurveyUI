import { useState, useEffect, useRef } from 'react';
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
  Pagination,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import { Header } from '../components/Header';
import { FilterBar } from '../components/FilterBar';
import { StudentList } from '../components/StudentList';
import { EmptyState } from '../components/EmptyState';
import { StartFilteringState } from '../components/StartFilteringState';
import { AlertDialog } from '../components/AlertDialog';
import type { AlertSeverity } from '../components/AlertDialog';
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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    name: '',
    uid: '',
    major: '',
    school: '',
    term: '',
    sources: [],
  });
  const [termOptions, setTermOptions] = useState<string[]>([]);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    severity: AlertSeverity;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, severity: 'error', title: '', message: '' });

  const showAlert = (severity: AlertSeverity, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ open: true, severity, title, message, onConfirm });
  };
  const closeAlert = () => setAlertState(s => ({ ...s, open: false }));

  const PAGE_SIZE = 20;

  // Stable serialised key for sources array — avoids array-reference comparison issues in deps
  const sourcesKey = filters.sources.join(',');

  useEffect(() => {
    api.getTerms().then(setTermOptions).catch(() => {});
  }, []);

  // Reset page to 1 whenever any filter value changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.name, filters.major, filters.school, filters.term, filters.uid, sourcesKey]);

  // Fetch students — uses AbortController to cancel stale in-flight requests
  useEffect(() => {
    const controller = new AbortController();

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * PAGE_SIZE;
        const data = await api.getStudents({
          limit: PAGE_SIZE,
          offset,
          name: filters.name || undefined,
          major: filters.major || undefined,
          school: filters.school || undefined,
          term: filters.term || undefined,
          uid: filters.uid || undefined,
          sources: filters.sources.length ? filters.sources : undefined,
        }, controller.signal);

        if (!controller.signal.aborted) {
          setStudents(data.students);
          setTotalCount(data.total || data.count);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch students');
          console.error('Error fetching students:', err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchStudents();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.name, filters.major, filters.school, filters.term, filters.uid, sourcesKey, currentPage]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // All filtering is now server-side; no client-side post-processing needed
  const filteredStudents = students;

  const handleSelectSource = async (
    studentUid: string,
    source: 'qualtrics' | 'linkedin' | 'clearinghouse'
  ) => {
    // Prevent concurrent saves for any student
    if (savingUid !== null) return;

    try {
      const student = students.find(s => s.uid === studentUid);
      if (!student) return;

      setSavingUid(studentUid);

      // Backend fetches source data and extracts all fields intelligently
      const result = await api.saveMasterData(studentUid, {
        term: student.term,
        selected_source: source,
      });

      const d = (result.data ?? {}) as Record<string, unknown>;
      const str = (key: string) => (d[key] != null ? String(d[key]) : '');

      // Update local state from what the backend extracted
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid === studentUid) {
            return {
              ...s,
              masterData: {
                id: `m_${studentUid}`,
                selectedSource: source,
                currentActivity: str('outcome_status'),
                employmentStatus: str('outcome_status'),
                currentEmployer: str('employer_name'),
                currentPosition: str('job_title'),
                currentInstitution: str('continuing_education_institution'),
                lastUpdated: new Date().toISOString(),
              } as MasterData,
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Error saving master data:', err);
      showAlert('error', 'Save Failed', err instanceof Error ? err.message : 'Failed to save master data. Please try again.');
    } finally {
      setSavingUid(null);
    }
  };

  const handleAddManual = async (studentUid: string, data: Record<string, unknown>) => {
    try {
      const student = students.find(s => s.uid === studentUid);
      await api.saveMasterData(studentUid, { ...data, term: student?.term ?? '', selected_source: 'manual' });
      const str = (k: string) => (data[k] != null ? String(data[k]) : '');
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid !== studentUid) return s;
          return {
            ...s,
            masterData: {
              id: `m_${studentUid}`,
              selectedSource: 'manual',
              currentActivity:    str('outcome_status'),
              employmentStatus:   str('outcome_status'),
              currentEmployer:    str('employer_name'),
              currentPosition:    str('job_title'),
              currentInstitution: str('continuing_education_institution'),
              lastUpdated: new Date().toISOString(),
            },
          };
        })
      );
    } catch (err) {
      console.error('Error saving manual data:', err);
      showAlert('error', 'Save Failed', 'Failed to save manual entry. Please try again.');
    }
  };

  const handleEditMaster = async (studentUid: string, data: Record<string, unknown>) => {
    try {
      const student = students.find(s => s.uid === studentUid);
      await api.saveMasterData(studentUid, { ...data, term: student?.term ?? '', selected_source: 'manual' });
      const str = (k: string) => (data[k] != null ? String(data[k]) : '');
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid !== studentUid || !s.masterData) return s;
          return {
            ...s,
            masterData: {
              ...s.masterData,
              currentActivity:    str('outcome_status') || s.masterData.currentActivity,
              employmentStatus:   str('outcome_status') || s.masterData.employmentStatus,
              currentEmployer:    str('employer_name')  || s.masterData.currentEmployer,
              currentPosition:    str('job_title')      || s.masterData.currentPosition,
              currentInstitution: str('continuing_education_institution') || s.masterData.currentInstitution,
              lastUpdated: new Date().toISOString(),
            },
          };
        })
      );
    } catch (err) {
      console.error('Error updating master data:', err);
      showAlert('error', 'Update Failed', 'Failed to update master record. Please try again.');
    }
  };

  const handleDeleteMaster = (studentUid: string) => {
    const student = students.find(s => s.uid === studentUid);
    if (!student) return;
    showAlert(
      'confirm',
      'Delete Master Record',
      'Are you sure you want to delete this master record? This action cannot be undone.',
      async () => {
        closeAlert();
        try {
          await api.deleteMasterData(studentUid, student.term);
          setStudents((prev) =>
            prev.map((s) => s.uid === studentUid ? { ...s, masterData: undefined } : s)
          );
          showAlert('success', 'Record Deleted', 'The master record has been successfully deleted.');
        } catch (err) {
          console.error('Error deleting master data:', err);
          showAlert('error', 'Delete Failed', 'Failed to delete master record. Please try again.');
        }
      }
    );
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
                  label={`${totalCount} Total Students • Page ${currentPage} of ${totalPages}`}
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
              <FilterBar filters={filters} onFilterChange={setFilters} termOptions={termOptions} />
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
                    onDeleteMaster={handleDeleteMaster}
                    savingUid={savingUid}
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        mt: 4,
                        mb: 4,
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => handlePageClick(page)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontWeight: 600,
                            fontSize: '1rem',
                          },
                          '& .Mui-selected': {
                            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%) !important',
                            color: 'white',
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Showing {filteredStudents.length > 0 ? ((currentPage - 1) * PAGE_SIZE + 1) : 0} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} students
                      </Typography>
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

      <AlertDialog
        open={alertState.open}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
      />
    </>
  );
};
