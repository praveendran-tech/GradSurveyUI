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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import { Header } from '../components/Header';
import { api } from '../api';
import {
  SCHOOLS,
  MAJORS,
  SCHOOL_CODE_TO_NAME,
  MAJOR_COMPOUND_TO_NAME,
  MAJOR_CODE_TO_NAME,
} from '../majorData';

// ── types ─────────────────────────────────────────────────────────────────────

interface OutcomeRow { label: string; n: number }
interface TableEntry { label?: string; n?: number; employer?: string; title?: string; institution?: string; program?: string; degree?: string }
interface ReportData {
  meta: { major: string; school: string; term: string; generated_at: string };
  totals: { total_graduates: number; survey_count: number; linkedin_count: number; clearinghouse_count: number; known_count: number; survey_response_rate: number; knowledge_rate: number };
  outcomes: { table: OutcomeRow[]; grand_total: number; placement_rate: number; employed_count: number; employed_pct: number };
  nature: { respondents: number; nature_counts: Record<string, number>; field_counts: Record<string, number>; modality_counts: Record<string, number> };
  salary: { n_reported: number; n_full_time: number; bonus_count: number; p25: number; p50: number; p75: number } | null;
  emp_search: { respondents: number; table: [string, number][] };
  geography: { respondents: number; table: [string, number][] };
  business: { count: number };
  volunteer: { count: number };
  military: { count: number };
  continuing_education: { count: number; umd_count: number; degree_table: [string, number][]; programs: TableEntry[] };
  otherexp: { respondents: number; table: [string, number][] };
  internships: { respondents: number; with_any: number; two_plus: number; paid_count: number; credit_count: number; total_reported: number; avg_hourly_wage: number | null; median_hourly_wage: number | null; intern_list: TableEntry[] };
  appendix_a: TableEntry[];
  appendix_b: TableEntry[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

const pct = (n: number, total: number) =>
  total === 0 ? 'N/A' : `${((n / total) * 100).toFixed(1)}%`;

const HeaderCell: React.FC<{ children: React.ReactNode; align?: 'left' | 'center' | 'right' }> = ({ children, align = 'left' }) => (
  <TableCell
    align={align}
    sx={{ bgcolor: '#E21833', color: 'white', fontWeight: 700, fontSize: '0.85rem', py: 1.2, whiteSpace: 'nowrap' }}
  >
    {children}
  </TableCell>
);

const DataRow: React.FC<{ cells: (string | number)[]; bold?: boolean; idx?: number }> = ({ cells, bold = false, idx = 0 }) => (
  <TableRow sx={{ bgcolor: idx % 2 === 0 ? '#fff8f8' : 'white' }}>
    {cells.map((v, i) => (
      <TableCell key={i} sx={{ py: 0.8, fontSize: '0.85rem', fontWeight: bold ? 700 : 400 }}>
        {v}
      </TableCell>
    ))}
  </TableRow>
);

// ── component ─────────────────────────────────────────────────────────────────

export const ReportPage: React.FC = () => {
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [terms, setTerms] = useState<string[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTerms().then(setTerms).catch(() => {});
  }, []);

  const availableMajors = selectedSchool === 'all'
    ? MAJORS
    : MAJORS.filter((m) => m.schoolCode === selectedSchool);

  const majorLabel = (() => {
    if (selectedMajor === 'all') return 'All Majors';
    const entry = MAJORS.find((m) => m.code === selectedMajor);
    return entry ? entry.name : selectedMajor;
  })();

  const schoolLabel = selectedSchool === 'all' ? 'All Schools' : (SCHOOL_CODE_TO_NAME[selectedSchool] ?? selectedSchool);

  const buildParams = () => ({
    major: selectedMajor === 'all' ? undefined : selectedMajor,
    school: selectedSchool === 'all' ? undefined : selectedSchool,
    term: selectedTerm === 'all' ? undefined : selectedTerm,
  });

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const data = await api.getReportData(buildParams()) as unknown as ReportData;
      setReportData(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate report preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = api.getReportDownloadUrl(buildParams());
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const major_part = selectedMajor === 'all' ? 'AllMajors' : selectedMajor.replace(/\s+/g, '_');
      const term_part = selectedTerm === 'all' ? 'AllTerms' : selectedTerm;
      const date_part = new Date().toISOString().split('T')[0];
      const filename = `GradOutcomesReport_${major_part}_${term_part}_${date_part}.docx`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const hasFilters = selectedMajor !== 'all' || selectedSchool !== 'all' || selectedTerm !== 'all';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {/* Page header */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <DescriptionIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Graduate Outcomes Report Generator
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Generate a detailed DOCX report — exactly like the official UMD Graduate Outcomes report — for any major, school, or term.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 4, alignItems: 'start' }}>

          {/* Left panel — filters */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 24 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Filters</Typography>
              {hasFilters && (
                <Button
                  size="small"
                  onClick={() => { setSelectedMajor('all'); setSelectedSchool('all'); setSelectedTerm('all'); setReportData(null); }}
                  sx={{ ml: 'auto', textTransform: 'none', color: 'text.secondary' }}
                >
                  Clear
                </Button>
              )}
            </Box>

            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>School</InputLabel>
                <Select
                  value={selectedSchool}
                  label="School"
                  onChange={(e) => {
                    const s = e.target.value;
                    setSelectedSchool(s);
                    const stillValid = s === 'all' || MAJORS.some((m) => m.schoolCode === s && m.code === selectedMajor);
                    if (!stillValid) setSelectedMajor('all');
                    setReportData(null);
                  }}
                >
                  <MenuItem value="all"><em>All Schools</em></MenuItem>
                  {SCHOOLS.map((s) => <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Major</InputLabel>
                <Select
                  value={selectedMajor}
                  label="Major"
                  onChange={(e) => {
                    const m = e.target.value;
                    setSelectedMajor(m);
                    if (m !== 'all') {
                      const entry = MAJORS.find((x) => x.code === m);
                      if (entry) setSelectedSchool(entry.schoolCode);
                    }
                    setReportData(null);
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

              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Term"
                  onChange={(e) => { setSelectedTerm(e.target.value); setReportData(null); }}
                >
                  <MenuItem value="all"><em>All Terms</em></MenuItem>
                  {terms.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Active filters */}
              {hasFilters && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {selectedSchool !== 'all' && (
                    <Chip size="small" label={`School: ${schoolLabel}`} color="primary" variant="outlined"
                      onDelete={() => { setSelectedSchool('all'); setSelectedMajor('all'); setReportData(null); }} />
                  )}
                  {selectedMajor !== 'all' && (
                    <Chip size="small" label={`Major: ${majorLabel}`} color="primary" variant="outlined"
                      onDelete={() => { setSelectedMajor('all'); setReportData(null); }} />
                  )}
                  {selectedTerm !== 'all' && (
                    <Chip size="small" label={`Term: ${selectedTerm}`} color="primary" variant="outlined"
                      onDelete={() => { setSelectedTerm('all'); setReportData(null); }} />
                  )}
                </Box>
              )}

              <Divider />

              <Button
                variant="contained"
                fullWidth
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AssessmentIcon />}
                onClick={handlePreview}
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
              >
                {loading ? 'Generating Preview…' : 'Preview Report'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                onClick={handleDownload}
                disabled={downloading}
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                {downloading ? 'Downloading…' : 'Download DOCX'}
              </Button>
            </Stack>
          </Paper>

          {/* Right panel — preview */}
          <Box>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {!reportData && !loading && (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Report Preview
                </Typography>
                <Typography variant="body2">
                  Select your filters and click <strong>Preview Report</strong> to see a live summary,
                  then click <strong>Download DOCX</strong> to get the formatted report.
                </Typography>
              </Paper>
            )}

            {loading && (
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Aggregating data from all sources…
                </Typography>
                <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
              </Paper>
            )}

            {reportData && !loading && (
              <Stack spacing={3}>

                {/* Cover / meta */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, borderLeft: '5px solid #E21833' }}>
                  <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                    Graduation Survey Report {
                      reportData.meta.term !== 'All Terms' && /^\d{4}/.test(reportData.meta.term)
                        ? reportData.meta.term.slice(0, 4)
                        : new Date().getFullYear()
                    }
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                    Report for {reportData.meta.major} Graduates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    University Career Center &amp; The President's Promise &nbsp;|&nbsp;
                    Generated {new Date(reportData.meta.generated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>

                  {/* Summary chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2.5 }}>
                    <Chip
                      label={`${reportData.totals.total_graduates} Total Graduates`}
                      sx={{ fontWeight: 700, bgcolor: '#E21833', color: 'white' }}
                    />
                    <Chip
                      label={`${reportData.totals.survey_response_rate}% Survey Response Rate`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${reportData.totals.knowledge_rate}% Knowledge Rate`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={`${reportData.outcomes.placement_rate}% Placement Rate`}
                      sx={{ fontWeight: 700, bgcolor: '#FFD200', color: '#000' }}
                    />
                  </Box>
                </Paper>

                {/* Career Outcomes */}
                <Accordion defaultExpanded elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                    <Typography fontWeight={700}>Career Outcomes</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <HeaderCell>Career Outcomes</HeaderCell>
                            <HeaderCell align="center">N</HeaderCell>
                            <HeaderCell align="center">%</HeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.outcomes.table.map((row, i) => (
                            <DataRow
                              key={row.label}
                              idx={i}
                              bold={row.label === 'Grand Total'}
                              cells={[
                                row.label,
                                row.n,
                                row.label === 'Grand Total' ? '' : pct(row.n, reportData.outcomes.grand_total),
                              ]}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>

                {/* Nature of Positions */}
                {reportData.nature.respondents >= 3 && (Object.keys(reportData.nature.nature_counts).length > 0 || Object.keys(reportData.nature.field_counts).length > 0) && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Nature of Positions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Out of {reportData.nature.respondents} graduates who answered survey questions:
                      </Typography>
                      {Object.entries(reportData.nature.nature_counts).map(([label, n]) => {
                        const total = Object.values(reportData.nature.nature_counts).reduce((a, b) => a + b, 0);
                        return (
                          <Box key={label} sx={{ mb: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2">{label}</Typography>
                              <Typography variant="body2" fontWeight={700}>{pct(n, total)}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={(n / total) * 100} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Salary */}
                {reportData.salary && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Salary</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: '#fffbf0', borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          {reportData.salary.n_full_time} graduates entering full-time employment reported salary ranges.
                          {reportData.salary.bonus_count > 0 && ` ${reportData.salary.bonus_count} reported receiving a bonus.`}
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Percentile</HeaderCell>
                              <HeaderCell align="right">Salary</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <DataRow idx={0} cells={['25th percentile', `$${reportData.salary.p25.toLocaleString()}`]} />
                            <DataRow idx={1} cells={['50th percentile (median)', `$${reportData.salary.p50.toLocaleString()}`]} />
                            <DataRow idx={2} cells={['75th percentile', `$${reportData.salary.p75.toLocaleString()}`]} />
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Employment Search */}
                {reportData.emp_search.respondents >= 3 && reportData.emp_search.table.length > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Employment Search Methods</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: '#fffbf0', borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          {reportData.emp_search.respondents} respondents answered questions about how they found their job.
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Method</HeaderCell>
                              <HeaderCell align="center">N</HeaderCell>
                              <HeaderCell align="center">%</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.emp_search.table.map(([label, n], i) => (
                              <DataRow key={label} idx={i} cells={[label, n, pct(n, reportData.emp_search.respondents)]} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Geographic Distribution */}
                {reportData.geography.respondents >= 3 && reportData.geography.table.length > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Geographic Distribution</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>State</HeaderCell>
                              <HeaderCell align="center">N</HeaderCell>
                              <HeaderCell align="center">%</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.geography.table.map(([state, n], i) => (
                              <DataRow key={state} idx={i} cells={[state, n, pct(n, reportData.geography.respondents)]} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Continuing Education */}
                <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                    <Typography fontWeight={700}>Continuing Education</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {reportData.continuing_education.count === 0 ? (
                      <Typography variant="body2" color="text.secondary">No graduates reported continuing education.</Typography>
                    ) : (
                      <>
                        <Typography variant="body2" gutterBottom>
                          <strong>{reportData.continuing_education.count}</strong> respondents reported continuing their education.
                          {reportData.continuing_education.umd_count > 0 &&
                            ` ${reportData.continuing_education.umd_count} are attending the University of Maryland, College Park.`}
                        </Typography>
                        {reportData.continuing_education.degree_table.length > 0 && (
                          <TableContainer sx={{ mt: 1.5 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <HeaderCell>Degree Type</HeaderCell>
                                  <HeaderCell align="center">N</HeaderCell>
                                  <HeaderCell align="center">%</HeaderCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.continuing_education.degree_table.map(([deg, n], i) => {
                                  const total = reportData.continuing_education.degree_table.reduce((a, [, v]) => a + v, 0);
                                  return <DataRow key={deg} idx={i} cells={[deg, n, pct(n, total)]} />;
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Out of Classroom */}
                {reportData.otherexp.respondents > 0 && reportData.otherexp.table.length > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Out of Classroom Experience</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: '#fffbf0', borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          {reportData.otherexp.respondents} respondents answered questions about experiences outside the classroom.
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Experience</HeaderCell>
                              <HeaderCell align="center">N</HeaderCell>
                              <HeaderCell align="center">%</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.otherexp.table.map(([label, n], i) => (
                              <DataRow key={label} idx={i} cells={[label, n, pct(n, reportData.otherexp.respondents)]} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Internships */}
                {reportData.internships.respondents > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Internship Participation</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>{pct(reportData.internships.with_any, reportData.internships.respondents)}</strong> of respondents ({reportData.internships.with_any}) had at least one internship.
                        </Typography>
                        {reportData.internships.with_any > 0 && (
                          <>
                            <Typography variant="body2">
                              <strong>{pct(reportData.internships.two_plus, reportData.internships.with_any)}</strong> completed two or more internships.
                            </Typography>
                            <Typography variant="body2">
                              Paid internships: <strong>{pct(reportData.internships.paid_count, reportData.internships.total_reported)}</strong>
                            </Typography>
                            <Typography variant="body2">
                              For academic credit: <strong>{pct(reportData.internships.credit_count, reportData.internships.total_reported)}</strong>
                            </Typography>
                            {reportData.internships.avg_hourly_wage && (
                              <Typography variant="body2">
                                Average hourly wage: <strong>${reportData.internships.avg_hourly_wage.toFixed(2)}/hr</strong> &nbsp;|&nbsp;
                                Median: <strong>${reportData.internships.median_hourly_wage?.toFixed(2)}/hr</strong>
                              </Typography>
                            )}
                          </>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Appendix A */}
                {reportData.appendix_a.length > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Appendix A: Employers &amp; Positions ({reportData.appendix_a.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Employer</HeaderCell>
                              <HeaderCell>Job Title</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.appendix_a.map((row, i) => (
                              <DataRow key={i} idx={i} cells={[row.employer ?? '', row.title ?? '']} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Appendix B */}
                {reportData.appendix_b.length > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Appendix B: Continuing Education Programs ({reportData.appendix_b.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Institution</HeaderCell>
                              <HeaderCell>Program</HeaderCell>
                              <HeaderCell>Degree</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.appendix_b.map((row, i) => (
                              <DataRow key={i} idx={i} cells={[row.institution ?? '', row.program ?? '', row.degree ?? '']} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Download CTA */}
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                    color: 'white',
                    borderRadius: 3,
                  }}
                  elevation={4}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Ready to Download?
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                      Get the full formatted DOCX report with all sections, professional styling, and appendices — identical to the official UMD Graduate Outcomes Report format.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                      onClick={handleDownload}
                      disabled={downloading}
                      sx={{
                        bgcolor: 'white',
                        color: '#E21833',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#FFD200', color: '#000' },
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      {downloading ? 'Downloading…' : 'Download DOCX Report'}
                    </Button>
                  </CardContent>
                </Card>

              </Stack>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
