import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { unparse } from 'papaparse';
import { Header } from '../components/Header';
import { mockStudents } from '../mockData';

export const DownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  // Extract unique values for filters
  const majors = Array.from(new Set(mockStudents.map((s) => s.major))).sort();
  const schools = Array.from(new Set(mockStudents.map((s) => s.school))).sort();
  const terms = Array.from(new Set(mockStudents.map((s) => s.term))).sort();

  const handleDownload = () => {
    // Filter students based on all selections
    let filteredStudents = mockStudents.filter((student) => {
      const matchesMajor = selectedMajor === 'all' || student.major === selectedMajor;
      const matchesSchool = selectedSchool === 'all' || student.school === selectedSchool;
      const matchesTerm = selectedTerm === 'all' || student.term === selectedTerm;
      return matchesMajor && matchesSchool && matchesTerm;
    });

    // Prepare data for CSV export
    const csvData = filteredStudents.map((student) => ({
      Name: student.name,
      UID: student.uid,
      Major: student.major,
      School: student.school,
      Term: student.term,
      'Has Qualtrics Data': student.qualtricsData ? 'Yes' : 'No',
      'Has LinkedIn Data': student.linkedInData ? 'Yes' : 'No',
      'Has ClearingHouse Data': student.clearingHouseData ? 'Yes' : 'No',
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
    return mockStudents.filter((student) => {
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
                <InputLabel>Major</InputLabel>
                <Select
                  value={selectedMajor}
                  label="Major"
                  onChange={(e) => setSelectedMajor(e.target.value)}
                >
                  <MenuItem value="all">
                    <em>All Majors</em>
                  </MenuItem>
                  {majors.map((major) => (
                    <MenuItem key={major} value={major}>
                      {major}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>School</InputLabel>
                <Select
                  value={selectedSchool}
                  label="School"
                  onChange={(e) => setSelectedSchool(e.target.value)}
                >
                  <MenuItem value="all">
                    <em>All Schools</em>
                  </MenuItem>
                  {schools.map((school) => (
                    <MenuItem key={school} value={school}>
                      {school}
                    </MenuItem>
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
                {selectedMajor !== 'all' && (
                  <Chip
                    label={`Major: ${selectedMajor}`}
                    onDelete={() => setSelectedMajor('all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {selectedSchool !== 'all' && (
                  <Chip
                    label={`School: ${selectedSchool.substring(0, 30)}...`}
                    onDelete={() => setSelectedSchool('all')}
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
