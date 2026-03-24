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
  OutlinedInput,
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
import {
  SCHOOLS,
  MAJORS,
  SCHOOL_CODE_TO_NAME,
} from '../majorData';

interface MasterRecord {
  student_id: string;
  graduation_term: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email_address: string | null;
  primary_major: string | null;
  secondary_major: string | null;
  tertiary_major: string | null;
  data_source: string | null;
  outcome_status: string | null;
  outcome_recorded_date: string | null;
  employer_name: string | null;
  job_title: string | null;
  employment_modality: string | null;
  employer_city: string | null;
  employer_state: string | null;
  employer_country: string | null;
  continuing_education_institution: string | null;
  continuing_education_program: string | null;
  continuing_education_degree: string | null;
  continuing_education_city: string | null;
  continuing_education_state: string | null;
  continuing_education_country: string | null;
  business_name: string | null;
  business_position_title: string | null;
  business_description: string | null;
  business_year_started: string | null;
  business_city: string | null;
  business_state: string | null;
  business_country: string | null;
  volunteer_organization: string | null;
  volunteer_role: string | null;
  volunteer_city: string | null;
  volunteer_state: string | null;
  volunteer_country: string | null;
  military_branch: string | null;
  military_rank: string | null;
  linkedin_profile_url: string | null;
  record_created_at: string | null;
  record_updated_at: string | null;
}

export const DownloadPage: React.FC = () => {
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [exportData, termList] = await Promise.all([
          api.getExportRecords(),
          api.getTerms(),
        ]);
        setRecords(exportData.records as unknown as MasterRecord[]);
        setTerms(termList);
      } catch (err) {
        console.error('Error fetching export data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableMajors = (selectedSchool === 'all'
    ? MAJORS
    : MAJORS.filter((m) => m.schoolCode === selectedSchool)
  ).slice().sort((a, b) => a.name.localeCompare(b.name));

  const getFilteredRecords = () =>
    records.filter((r) => {
      const matchesMajor = selectedMajors.length === 0 || selectedMajors.includes(r.primary_major ?? '');
      const matchesTerm = selectedTerms.length === 0 || selectedTerms.includes(r.graduation_term ?? '');
      const matchesSchool = selectedSchool === 'all' || (() => {
        const entry = MAJORS.find((m) => m.code === r.primary_major);
        return entry?.schoolCode === selectedSchool;
      })();
      return matchesMajor && matchesTerm && matchesSchool;
    });

  const handleDownload = () => {
    const filtered = getFilteredRecords();
    const csvData = filtered.map((r) => ({
      'UID': r.student_id,
      'Full Name': r.full_name ?? '',
      'First Name': r.first_name ?? '',
      'Last Name': r.last_name ?? '',
      'Email': r.email_address ?? '',
      'Primary Major': r.primary_major ?? '',
      'Secondary Major': r.secondary_major ?? '',
      'Tertiary Major': r.tertiary_major ?? '',
      'Graduation Term': r.graduation_term ?? '',
      'Data Source': r.data_source ?? '',
      'Outcome Status': r.outcome_status ?? '',
      'Outcome Recorded Date': r.outcome_recorded_date ?? '',
      // Employment
      'Employer Name': r.employer_name ?? '',
      'Job Title': r.job_title ?? '',
      'Employment Modality': r.employment_modality ?? '',
      'Employer City': r.employer_city ?? '',
      'Employer State': r.employer_state ?? '',
      'Employer Country': r.employer_country ?? '',
      // Continuing Education
      'CE Institution': r.continuing_education_institution ?? '',
      'CE Program': r.continuing_education_program ?? '',
      'CE Degree': r.continuing_education_degree ?? '',
      'CE City': r.continuing_education_city ?? '',
      'CE State': r.continuing_education_state ?? '',
      'CE Country': r.continuing_education_country ?? '',
      // Business / Entrepreneur
      'Business Name': r.business_name ?? '',
      'Business Position Title': r.business_position_title ?? '',
      'Business Description': r.business_description ?? '',
      'Business Year Started': r.business_year_started ?? '',
      'Business City': r.business_city ?? '',
      'Business State': r.business_state ?? '',
      'Business Country': r.business_country ?? '',
      // Volunteer
      'Volunteer Organization': r.volunteer_organization ?? '',
      'Volunteer Role': r.volunteer_role ?? '',
      'Volunteer City': r.volunteer_city ?? '',
      'Volunteer State': r.volunteer_state ?? '',
      'Volunteer Country': r.volunteer_country ?? '',
      // Military
      'Military Branch': r.military_branch ?? '',
      'Military Rank': r.military_rank ?? '',
      // Other
      'LinkedIn Profile URL': r.linkedin_profile_url ?? '',
      'Record Created': r.record_created_at
        ? new Date(r.record_created_at).toLocaleString()
        : '',
      'Last Updated': r.record_updated_at
        ? new Date(r.record_updated_at).toLocaleString()
        : '',
    }));

    const csv = unparse(csvData);
    const majorPart = selectedMajors.length ? selectedMajors.join('_').replace(/\s+/g, '_') : 'AllMajors';
    const schoolPart = selectedSchool === 'all' ? 'AllSchools' : selectedSchool.substring(0, 20).replace(/\s+/g, '_');
    const termPart = selectedTerms.length ? selectedTerms.join('_').replace(/\s+/g, '_') : 'AllTerms';
    const datePart = new Date().toISOString().split('T')[0];

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `GraduateSurvey_${majorPart}_${schoolPart}_${termPart}_${datePart}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedMajors([]);
    setSelectedSchool('all');
    setSelectedTerms([]);
  };

  const hasActiveFilters = selectedMajors.length > 0 || selectedSchool !== 'all' || selectedTerms.length > 0;
  const filteredCount = getFilteredRecords().length;

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
                Export Master Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download records from the master graduate outcomes database
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
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
                        if (school !== 'all') {
                          const validCodes = new Set(MAJORS.filter((m) => m.schoolCode === school).map((m) => m.code));
                          setSelectedMajors((prev) => prev.filter((c) => validCodes.has(c)));
                        }
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
                    <InputLabel id="dl-major-label">Major</InputLabel>
                    <Select<string[]>
                      labelId="dl-major-label"
                      multiple
                      value={selectedMajors}
                      input={<OutlinedInput label="Major" />}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMajors(typeof val === 'string' ? val.split(',') : val);
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.length === 0
                            ? <em style={{ color: '#999' }}>All Majors</em>
                            : selected.map((code) => {
                                const entry = MAJORS.find((m) => m.code === code);
                                return <Chip key={code} label={entry ? entry.name : code} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />;
                              })}
                        </Box>
                      )}
                    >
                      {availableMajors.map((m) => (
                        <MenuItem key={`${m.schoolCode}-${m.code}`} value={m.code}>{m.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="dl-term-label">Term</InputLabel>
                    <Select<string[]>
                      labelId="dl-term-label"
                      multiple
                      value={selectedTerms}
                      input={<OutlinedInput label="Term" />}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedTerms(typeof val === 'string' ? val.split(',') : val);
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.length === 0
                            ? <em style={{ color: '#999' }}>All Terms</em>
                            : selected.map((t) => <Chip key={t} label={t} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />)}
                        </Box>
                      )}
                    >
                      {terms.map((term) => (
                        <MenuItem key={term} value={term}>{term}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              {/* Active Filters */}
              {hasActiveFilters && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Active Filters:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedSchool !== 'all' && (
                      <Chip
                        label={`School: ${SCHOOL_CODE_TO_NAME[selectedSchool] ?? selectedSchool}`}
                        onDelete={() => { setSelectedSchool('all'); setSelectedMajors([]); }}
                        color="primary" variant="outlined"
                      />
                    )}
                    {selectedMajors.map((code) => (
                      <Chip
                        key={code}
                        label={`Major: ${MAJORS.find((m) => m.code === code)?.name ?? code}`}
                        onDelete={() => setSelectedMajors((prev) => prev.filter((c) => c !== code))}
                        color="primary" variant="outlined"
                      />
                    ))}
                    {selectedTerms.map((t) => (
                      <Chip
                        key={t}
                        label={`Term: ${t}`}
                        onDelete={() => setSelectedTerms((prev) => prev.filter((x) => x !== t))}
                        color="primary" variant="outlined"
                      />
                    ))}
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
                      label={`${filteredCount} master records`}
                      sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700, fontSize: '1rem' }}
                      size="medium"
                    />
                    <Chip
                      label={`${records.length} total in master DB`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
                    <strong>CSV will include:</strong> UID, Name, Email, Major (primary/secondary/tertiary),
                    Term, Data Source, Outcome Status, Employment, Continuing Education,
                    Business/Entrepreneur, Volunteer, Military, LinkedIn URL, and timestamps.
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
                disabled={filteredCount === 0}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 4,
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                  transition: 'all 0.3s ease',
                }}
              >
                Download CSV Report ({filteredCount} records)
              </Button>
            </>
          )}
        </Paper>

        {/* Instructions */}
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
              How to Use
            </Typography>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                <strong>1.</strong> This page exports only students who have been saved to the master database via the Dashboard.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>2.</strong> Select optional filters for Major, School, and/or Term to narrow the export.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>3.</strong> Click "Download CSV Report" to generate and download the file.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tip:</strong> To add students to the master database, go to the Dashboard, find a student, and select their data source.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
