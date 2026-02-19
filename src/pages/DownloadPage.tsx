import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { unparse } from 'papaparse';
import { Header } from '../components/Header';
import { api } from '../api';
import type { Student } from '../types';
import {
  SCHOOLS,
  MAJORS,
  SCHOOL_CODE_TO_NAME,
  MAJOR_COMPOUND_TO_NAME,
  MAJOR_CODE_TO_NAME,
} from '../majorData';

export const DownloadPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  // Fetch all students from API (no pagination for download page)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Fetch all students by using a large limit
        const data = await api.getStudents({ limit: 10000, offset: 0 });
        setStudents(data.students);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Terms derived from actual data; schools/majors come from static canonical list
  const terms = Array.from(new Set(students.map((s: Student) => s.term))).sort();

  // Majors filtered by selected school (or all if none selected)
  const availableMajors = selectedSchool === 'all'
    ? MAJORS
    : MAJORS.filter((m) => m.schoolCode === selectedSchool);

  const handleDownload = () => {
    // Filter students based on all selections
    let filteredStudents = students.filter((student: Student) => {
      const matchesMajor = selectedMajor === 'all' || student.major === selectedMajor;
      const matchesSchool = selectedSchool === 'all' || student.school === selectedSchool;
      const matchesTerm = selectedTerm === 'all' || student.term === selectedTerm;
      return matchesMajor && matchesSchool && matchesTerm;
    });

    // Prepare data for CSV export
    const csvData = filteredStudents.map((student: Student) => ({
      Name: student.name,
      UID: student.uid,
      Major: MAJOR_COMPOUND_TO_NAME[`${student.school}|${student.major}`] ?? MAJOR_CODE_TO_NAME[student.major] ?? student.major,
      School: SCHOOL_CODE_TO_NAME[student.school] ?? student.school,
      Term: student.term,
      'Has Qualtrics Data': student.qualtrics_data && student.qualtrics_data.length > 0 ? 'Yes' : 'No',
      'Has LinkedIn Data': student.linkedin_data && student.linkedin_data.length > 0 ? 'Yes' : 'No',
      'Has ClearingHouse Data': student.clearinghouse_data && student.clearinghouse_data.length > 0 ? 'Yes' : 'No',
      'In Master Database': student.masterData ? 'Yes' : 'No',
      'Selected Source': student.masterData?.selectedSource || 'N/A',
      'Employment Status': student.masterData?.employmentStatus || 'N/A',
      'Current Employer': student.masterData?.currentEmployer || 'N/A',
      'Current Position': student.masterData?.currentPosition || 'N/A',
      'Enrollment Status': student.masterData?.enrollmentStatus || 'N/A',
      'Current Institution': student.masterData?.currentInstitution || 'N/A',
      'Last Updated': student.masterData?.lastUpdated
        ? new Date(student.masterData.lastUpdated).toLocaleString()
        : 'N/A',
    }));

    // Convert to CSV
    const csv = unparse(csvData);

    // Create filename with all filters
    const majorPart = selectedMajor === 'all' ? 'AllMajors' : selectedMajor.replace(/\s+/g, '_');
    const schoolPart = selectedSchool === 'all' ? 'AllSchools' : selectedSchool.substring(0, 20).replace(/\s+/g, '_');
    const termPart = selectedTerm === 'all' ? 'AllTerms' : selectedTerm.replace(/\s+/g, '_');
    const datePart = new Date().toISOString().split('T')[0];

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GraduateSurvey_${majorPart}_${schoolPart}_${termPart}_${datePart}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredCount = () => {
    return students.filter((student: Student) => {
      const matchesMajor = selectedMajor === 'all' || student.major === selectedMajor;
      const matchesSchool = selectedSchool === 'all' || student.school === selectedSchool;
      const matchesTerm = selectedTerm === 'all' || student.term === selectedTerm;
      return matchesMajor && matchesSchool && matchesTerm;
    }).length;
  };

  const resetFilters = () => {
    setSelectedMajor('all');
    setSelectedSchool('all');
    setSelectedTerm('all');
  };

  const hasActiveFilters = selectedMajor !== 'all' || selectedSchool !== 'all' || selectedTerm !== 'all';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileDownloadIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ mb: 0, fontWeight: 600 }}>
                Export Data Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apply multiple filters and download comprehensive CSV reports
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Filter Section */}
          <Box
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'rgba(226, 24, 51, 0.03)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Apply Filters
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  onClick={resetFilters}
                  sx={{ ml: 'auto', textTransform: 'none' }}
                >
                  Clear All
                </Button>
              )}
            </Box>

            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>School</InputLabel>
                <Select
                  value={selectedSchool}
                  label="School"
                  onChange={(e) => {
                    const school = e.target.value;
                    setSelectedSchool(school);
                    // Clear major if it doesn't belong to the new school
                    const majorStillValid = school === 'all' ||
                      MAJORS.some((m) => m.schoolCode === school && m.code === selectedMajor);
                    if (!majorStillValid) setSelectedMajor('all');
                  }}
                  renderValue={(val) => val === 'all' ? 'All Schools' : (SCHOOL_CODE_TO_NAME[val] ?? val)}
                >
                  <MenuItem value="all"><em>All Schools</em></MenuItem>
                  {SCHOOLS.map((s) => (
                    <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Major</InputLabel>
                <Select
                  value={selectedMajor}
                  label="Major"
                  onChange={(e) => {
                    const major = e.target.value;
                    setSelectedMajor(major);
                    // Auto-select school when major is chosen
                    if (major !== 'all') {
                      const entry = MAJORS.find((m) => m.code === major);
                      if (entry) setSelectedSchool(entry.schoolCode);
                    }
                  }}
                  renderValue={(val) => {
                    if (val === 'all') return 'All Majors';
                    const entry = MAJORS.find((m) => m.code === val);
                    return entry ? entry.name : val;
                  }}
                >
                  <MenuItem value="all"><em>All Majors</em></MenuItem>
                  {availableMajors.map((m) => (
                    <MenuItem key={`${m.schoolCode}-${m.code}`} value={m.code}>{m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Term"
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <MenuItem value="all">
                    <em>All Terms</em>
                  </MenuItem>
                  {terms.map((term) => (
                    <MenuItem key={term} value={term}>
                      {term}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Active Filters:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedSchool !== 'all' && (
                  <Chip
                    label={`School: ${SCHOOL_CODE_TO_NAME[selectedSchool] ?? selectedSchool}`}
                    onDelete={() => { setSelectedSchool('all'); setSelectedMajor('all'); }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {selectedMajor !== 'all' && (
                  <Chip
                    label={`Major: ${MAJORS.find((m) => m.code === selectedMajor)?.name ?? selectedMajor}`}
                    onDelete={() => setSelectedMajor('all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {selectedTerm !== 'all' && (
                  <Chip
                    label={`Term: ${selectedTerm}`}
                    onDelete={() => setSelectedTerm('all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Export Summary */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
              color: 'white',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Export Summary
              </Typography>
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
                <Chip
                  label={`${getFilteredCount()} students`}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                  size="medium"
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
                <strong>CSV will include:</strong> Name, UID, Major, School, Term, Data Source
                Availability, Master Database Status, Employment Info, Enrollment Info, and
                Timestamps
              </Typography>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={getFilteredCount() === 0}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 4,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Download CSV Report ({getFilteredCount()} students)
          </Button>
        </Paper>

        {/* Instructions Card */}
        <Card
          sx={{
            mt: 4,
            bgcolor: 'background.paper',
            borderLeft: '4px solid',
            borderColor: 'secondary.main',
          }}
          elevation={2}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
              📋 How to Use
            </Typography>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                <strong>1.</strong> Select your desired filters for Major, School, and/or Term
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>2.</strong> Leave filters as "All" to include all values for that category
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>3.</strong> Review the export summary to confirm the student count
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>4.</strong> Click "Download CSV Report" to generate and download the file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>💡 Tip:</strong> You can combine multiple filters to create specific
                reports (e.g., Computer Science students from Fall 2024)
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
