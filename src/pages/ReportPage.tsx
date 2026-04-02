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
} from '../majorData';

// ── types ─────────────────────────────────────────────────────────────────────

interface OutcomeRow { label: string; n: number }
interface TableEntry { label?: string; n?: number; employer?: string; title?: string; institution?: string; program?: string; degree?: string }
interface ReportData {
  meta: { major: string; school: string; term: string; generated_at: string };
  demographics?: { table: [string, number][] };
  totals: { total_graduates: number; survey_count: number; linkedin_count: number; clearinghouse_count: number; known_count: number; survey_response_rate: number; knowledge_rate: number };
  outcomes: { table: OutcomeRow[]; grand_total: number; placement_rate: number; employed_count: number; employed_pct: number; in_workforce_count: number; in_workforce_pct: number };
  nature: { respondents: number; nature_counts: Record<string, number>; field_counts: Record<string, number>; modality_counts: Record<string, number>; emp_status_counts: Record<string, number> };
  salary: { n_reported: number; n_full_time: number; bonus_count: number; bonus_median: number | null; bonus_list: string[]; p25: number; p50: number; p75: number } | null;
  emp_search: { respondents: number; table: [string, number][] };
  geography: { respondents: number; table: [string, number][] };
  business: { count: number; details: { org: string; purpose: string }[] };
  volunteer: { count: number; details: { org: string; role: string }[] };
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

// Standard degree categories per feedback Q16
const DEGREE_CATEGORY_ORDER = [
  'Masters/MBA',
  'Ph.D. or Doctoral',
  'Health Professional (MD, DO, Pharm.D., Au.D., etc.)',
  'Unspecified',
  'Law (J.D.)',
  'Certificate/Certification',
  "Second Bachelor's Degree",
  'Non-Degree Seeking (Post-Bac., cont. Edu. Credits)',
  "Associate's Degree",
];

function normalizeDegree(raw: string): string {
  const s = (raw || '').toLowerCase().trim();
  if (!s || s === 'null' || s === 'unspecified' || s === 'unknown' || s === 'n/a') return 'Unspecified';
  if (s.includes('master') || s.includes('mba') || s.includes('m.b.a') || s === 'm.s.' || s === 'm.a.' || s.startsWith('ms') || s.startsWith('ma ')) return 'Masters/MBA';
  if (s.includes('ph.d') || s.includes('phd') || s.includes('doctor') || s.includes('doctoral') || s.includes('d.phil')) return 'Ph.D. or Doctoral';
  if (s.includes('m.d') || s.includes(' md') || s === 'md' || s.includes('pharm') || s.includes('au.d') || s.includes('d.o') || s === 'do' || s.includes('dvm') || s.includes('dds') || s.includes('d.m.d') || s.includes('health professional')) return 'Health Professional (MD, DO, Pharm.D., Au.D., etc.)';
  if (s.includes('j.d') || s === 'jd' || s.includes('juris') || s.includes(' law') || s === 'law') return 'Law (J.D.)';
  if (s.includes('certif')) return 'Certificate/Certification';
  if (s.includes('second bachelor') || s.includes('2nd bachelor')) return "Second Bachelor's Degree";
  if (s.includes('non-degree') || s.includes('non degree') || s.includes('post-bac') || s.includes('post bac') || s.includes('cont. edu') || s.includes('continuing education credit')) return 'Non-Degree Seeking (Post-Bac., cont. Edu. Credits)';
  if (s.includes('associate')) return "Associate's Degree";
  // Fall back to Unspecified for anything we can't categorise
  return 'Unspecified';
}

function aggregateDegrees(rawTable: [string, number][]): [string, number][] {
  const counts: Record<string, number> = {};
  rawTable.forEach(([deg, n]) => {
    const cat = normalizeDegree(deg);
    counts[cat] = (counts[cat] ?? 0) + n;
  });
  // Return in standard order, then any remaining
  const result: [string, number][] = [];
  DEGREE_CATEGORY_ORDER.forEach((cat) => {
    if (counts[cat]) result.push([cat, counts[cat]]);
  });
  Object.entries(counts).forEach(([cat, n]) => {
    if (!DEGREE_CATEGORY_ORDER.includes(cat)) result.push([cat, n]);
  });
  return result;
}

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
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTerms()
      .then(setTerms)
      .catch((e) => console.error('Failed to load terms:', e))
      .finally(() => setTermsLoading(false));
  }, []);

  const availableMajors = (selectedSchool === 'all'
    ? MAJORS
    : MAJORS.filter((m) => m.schoolCode === selectedSchool)
  ).slice().sort((a, b) => a.name.localeCompare(b.name)).filter(
    (m, idx, arr) => idx === 0 || m.name !== arr[idx - 1].name
  );

  const schoolLabel = selectedSchool === 'all' ? 'All Schools' : (SCHOOL_CODE_TO_NAME[selectedSchool] ?? selectedSchool);

  const buildParams = () => ({
    major: selectedMajors.length ? selectedMajors : undefined,
    school: selectedSchool === 'all' ? undefined : selectedSchool,
    term: selectedTerms.length ? selectedTerms : undefined,
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
      const major_part = selectedMajors.length ? selectedMajors.join('_').replace(/\s+/g, '_') : 'AllMajors';
      const term_part = selectedTerms.length ? selectedTerms.join('_') : 'AllTerms';
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

  const hasFilters = selectedMajors.length > 0 || selectedSchool !== 'all' || selectedTerms.length > 0;

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
                  onClick={() => { setSelectedMajors([]); setSelectedSchool('all'); setSelectedTerms([]); setReportData(null); }}
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
                    // Remove majors that don't belong to the new school
                    if (s !== 'all') {
                      const validCodes = new Set(MAJORS.filter((m) => m.schoolCode === s).map((m) => m.code));
                      setSelectedMajors((prev) => prev.filter((c) => validCodes.has(c)));
                    }
                    setReportData(null);
                  }}
                >
                  <MenuItem value="all"><em>All Schools</em></MenuItem>
                  {SCHOOLS.map((s) => <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="report-major-label">Major</InputLabel>
                <Select<string[]>
                  labelId="report-major-label"
                  multiple
                  value={selectedMajors}
                  input={<OutlinedInput label="Major" />}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMajors(typeof val === 'string' ? val.split(',') : val);
                    setReportData(null);
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

              <FormControl fullWidth size="small">
                <InputLabel id="report-term-label">Term</InputLabel>
                <Select<string[]>
                  labelId="report-term-label"
                  multiple
                  value={selectedTerms}
                  input={<OutlinedInput label="Term" />}
                  disabled={termsLoading}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTerms(typeof val === 'string' ? val.split(',') : val);
                    setReportData(null);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0
                        ? <em style={{ color: '#999' }}>{termsLoading ? 'Loading…' : 'All Terms'}</em>
                        : selected.map((t) => <Chip key={t} label={t} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />)}
                    </Box>
                  )}
                >
                  {terms.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Active filters */}
              {hasFilters && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {selectedSchool !== 'all' && (
                    <Chip size="small" label={`School: ${schoolLabel}`} color="primary" variant="outlined"
                      onDelete={() => { setSelectedSchool('all'); setSelectedMajors([]); setReportData(null); }} />
                  )}
                  {selectedMajors.map((code) => {
                    const entry = MAJORS.find((m) => m.code === code);
                    return (
                      <Chip key={code} size="small" label={`Major: ${entry ? entry.name : code}`} color="primary" variant="outlined"
                        onDelete={() => { setSelectedMajors((prev) => prev.filter((c) => c !== code)); setReportData(null); }} />
                    );
                  })}
                  {selectedTerms.map((t) => (
                    <Chip key={t} size="small" label={`Term: ${t}`} color="primary" variant="outlined"
                      onDelete={() => { setSelectedTerms((prev) => prev.filter((x) => x !== t)); setReportData(null); }} />
                  ))}
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
                    <Chip
                      label={`${reportData.outcomes.in_workforce_pct}% In Workforce`}
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </Paper>

                {/* Demographics */}
                {reportData.demographics && reportData.demographics.table.length > 0 && (
                  <Accordion defaultExpanded elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Demographics</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Track</HeaderCell>
                              <HeaderCell align="center">N</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.demographics.table.map(([track, n], i) => (
                              <DataRow key={track} idx={i} cells={[track, n]} />
                            ))}
                            <DataRow
                              bold
                              idx={reportData.demographics.table.length}
                              cells={[
                                'Total',
                                reportData.demographics.table.reduce((sum, [, n]) => sum + n, 0),
                              ]}
                            />
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          Note: Throughout this report, percentages may not sum to 100% due to rounding.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

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
                    <Box sx={{ px: 2, py: 1.5, bgcolor: '#fffbf0', borderTop: '1px solid #eee' }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>% In Workforce</strong> includes graduates who are Employed full-time, Employed part-time, Participating in a volunteer or service program, Serving in the military, or Starting a business — divided by the total number of graduates with known outcomes (including job seekers).
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Nature of Positions */}
                {reportData.nature.respondents >= 3 && (
                  Object.keys(reportData.nature.nature_counts).length > 0 ||
                  Object.keys(reportData.nature.field_counts).length > 0 ||
                  Object.keys(reportData.nature.emp_status_counts ?? {}).length > 0 ||
                  Object.keys(reportData.nature.modality_counts ?? {}).length > 0
                ) && (() => {
                  const fieldEntries = Object.entries(reportData.nature.field_counts);
                  const fieldTotal = fieldEntries.reduce((s, [, n]) => s + n, 0);

                  // Categorise field_counts entries into directly/somewhat/not related
                  let directN = 0, somewhatN = 0, notN = 0;
                  fieldEntries.forEach(([label, n]) => {
                    const l = label.toLowerCase();
                    if (l.includes('not') || l.includes('unrelated')) notN += n;
                    else if (l.includes('somewhat') || l.includes('utilizes') || l.includes('skills')) somewhatN += n;
                    else directN += n;
                  });
                  const relatedN   = directN + somewhatN;
                  const relatedPct = fieldTotal > 0 ? Math.round((relatedN   / fieldTotal) * 100) : 0;
                  const directPct  = fieldTotal > 0 ? Math.round((directN    / fieldTotal) * 100) : 0;
                  const somewhatPct= fieldTotal > 0 ? Math.round((somewhatN  / fieldTotal) * 100) : 0;
                  const notPct     = fieldTotal > 0 ? Math.round((notN       / fieldTotal) * 100) : 0;

                  const natureEntries = Object.entries(reportData.nature.nature_counts);
                  const natureTotal = natureEntries.reduce((s, [, n]) => s + n, 0);

                  const statusEntries = Object.entries(reportData.nature.emp_status_counts ?? {});
                  const statusTotal = statusEntries.reduce((s, [, n]) => s + n, 0);

                  const modalityEntries = Object.entries(reportData.nature.modality_counts ?? {});
                  const modalityTotal = modalityEntries.reduce((s, [, n]) => s + n, 0);

                  return (
                    <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                        <Typography fontWeight={700}>Nature of Positions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Narrative paragraph for field-of-study relationship */}
                        {fieldTotal > 0 && (
                          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, borderLeft: '4px solid #E21833' }}>
                            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                              {relatedPct > 0 && (
                                <>
                                  <strong>{relatedPct}%</strong> replied that their employment is either directly related to their field of study/major (<strong>{directPct}%</strong>) or utilizes knowledge, skills and abilities gained through their study (<strong>{somewhatPct}%</strong>).
                                  {notPct > 0 && <> <strong>{notPct}%</strong> indicated that their position was not at all related to their field of study/major.</>}
                                </>
                              )}
                            </Typography>
                          </Box>
                        )}

                        {/* Progress bars for nature_counts (employment type breakdown) */}
                        {natureEntries.length > 0 && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Out of {reportData.nature.respondents} graduates who answered survey questions:
                            </Typography>
                            {natureEntries.map(([label, n]) => (
                              <Box key={label} sx={{ mb: 1.5 }}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                  <Typography variant="body2">{label}</Typography>
                                  <Typography variant="body2" fontWeight={700}>{pct(n, natureTotal)}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={(n / natureTotal) * 100} sx={{ height: 8, borderRadius: 4 }} />
                              </Box>
                            ))}
                          </>
                        )}

                        {/* Employment status (EMP_TYPE) */}
                        {statusEntries.length > 0 && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: natureEntries.length > 0 ? 2 : 0 }}>
                              Employment status:
                            </Typography>
                            {statusEntries.map(([label, n]) => (
                              <Box key={label} sx={{ mb: 1.5 }}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                  <Typography variant="body2">{label}</Typography>
                                  <Typography variant="body2" fontWeight={700}>{pct(n, statusTotal)}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={(n / statusTotal) * 100} sx={{ height: 8, borderRadius: 4 }} />
                              </Box>
                            ))}
                          </>
                        )}

                        {/* Employment modality (EMP_JOBSITE) */}
                        {modalityEntries.length > 0 && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                              Employment modality (in-person, remote, hybrid):
                            </Typography>
                            {modalityEntries.map(([label, n]) => (
                              <Box key={label} sx={{ mb: 1.5 }}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                  <Typography variant="body2">{label}</Typography>
                                  <Typography variant="body2" fontWeight={700}>{pct(n, modalityTotal)}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={(n / modalityTotal) * 100} sx={{ height: 8, borderRadius: 4 }} />
                              </Box>
                            ))}
                          </>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}

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
                      {/* Bonus section */}
                      {reportData.salary.bonus_count > 0 && (
                        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>Bonus</Typography>
                          {reportData.salary.bonus_median != null ? (
                            <Typography variant="body2">
                              Median bonus: <strong>${reportData.salary.bonus_median.toLocaleString()}</strong>
                              {' '}({reportData.salary.bonus_count} {reportData.salary.bonus_count === 1 ? 'respondent' : 'respondents'})
                            </Typography>
                          ) : reportData.salary.bonus_list && reportData.salary.bonus_list.length > 0 ? (
                            <Typography variant="body2">
                              Reported bonus values: {reportData.salary.bonus_list.join(', ')}
                            </Typography>
                          ) : null}
                        </Box>
                      )}
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

                {/* Starting a Business */}
                {reportData.business.count > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Starting a Business</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: '#fffbf0', borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          {reportData.business.count} graduate{reportData.business.count !== 1 ? 's' : ''} reported starting a business.
                        </Typography>
                      </Box>
                      {reportData.business.details.length > 0 && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <HeaderCell>Organization</HeaderCell>
                                <HeaderCell>Purpose / Description</HeaderCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.business.details.map((row, i) => (
                                <DataRow key={i} idx={i} cells={[row.org, row.purpose]} />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Volunteering / Service */}
                {reportData.volunteer.count > 0 && (
                  <Accordion elevation={2} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography fontWeight={700}>Volunteering / Service Program</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Box sx={{ p: 2, bgcolor: '#fffbf0', borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2" color="text.secondary">
                          {reportData.volunteer.count} graduate{reportData.volunteer.count !== 1 ? 's' : ''} reported volunteering or participating in a service program.
                        </Typography>
                      </Box>
                      {reportData.volunteer.details.length > 0 && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <HeaderCell>Organization</HeaderCell>
                                <HeaderCell>Role</HeaderCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.volunteer.details.map((row, i) => (
                                <DataRow key={i} idx={i} cells={[row.org, row.role]} />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
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
                        {reportData.continuing_education.degree_table.length > 0 && (() => {
                          const normalised = aggregateDegrees(reportData.continuing_education.degree_table);
                          const total = normalised.reduce((a, [, v]) => a + v, 0);
                          return (
                            <TableContainer sx={{ mt: 1.5 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <HeaderCell>Type of Degree/Program</HeaderCell>
                                    <HeaderCell align="center">#</HeaderCell>
                                    <HeaderCell align="center">%</HeaderCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {normalised.map(([deg, n], i) => (
                                    <DataRow key={deg} idx={i} cells={[deg, n, pct(n, total)]} />
                                  ))}
                                  <DataRow bold idx={normalised.length} cells={['Total', total, '100.0%']} />
                                </TableBody>
                              </Table>
                            </TableContainer>
                          );
                        })()}
                        {reportData.continuing_education.programs.length > 0 && (
                          <TableContainer sx={{ mt: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <HeaderCell>Institution</HeaderCell>
                                  <HeaderCell>Program</HeaderCell>
                                  <HeaderCell>Degree</HeaderCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.continuing_education.programs.map((row, i) => (
                                  <DataRow key={i} idx={i} cells={[row.institution ?? '', row.program ?? '', row.degree ?? '']} />
                                ))}
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
