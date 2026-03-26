import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Grid, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip,
  Button, Stack, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
  ComposedChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { Header } from '../components/Header';
import { api } from '../api';
import { SCHOOLS, MAJORS, SCHOOL_CODE_TO_NAME } from '../majorData';

// ── colour palettes ────────────────────────────────────────────────────────────
const UMD_RED  = '#E21833';
const UMD_GOLD = '#FFD200';
const UMD_NAVY = '#1E293B';

const CHART_COLORS = ['#E21833','#3B82F6','#10B981','#F59E0B','#8B5CF6','#06B6D4','#EC4899','#14B8A6','#F97316','#6366F1'];

const OUTCOME_COLOR: Record<string, string> = {
  'Employed full-time':                              '#10B981',
  'Employed part-time':                              '#34D399',
  'Continuing education':                            '#3B82F6',
  'Participating in a volunteer or service program': '#06B6D4',
  'Serving in the U.S. Armed Forces':                '#1E293B',
  'Starting a business':                             '#8B5CF6',
  'Unplaced':                                        '#F59E0B',
  'Unresolved':                                      UMD_RED,
  'Not seeking':                                     '#94A3B8',
};

// ── types ──────────────────────────────────────────────────────────────────────
interface LongitudinalPoint {
  term: string;
  total_graduates: number;
  placement_rate: number;
  knowledge_rate: number;
  survey_response_rate: number;
  in_workforce_pct: number;
  salary_p25: number | null;
  salary_p50: number | null;
  salary_p75: number | null;
  internship_pct: number;
  outcomes: Record<string, number>;
}

interface SchoolComparison {
  school: string;
  total: number;
  placement_rate: number;
  knowledge_rate: number;
  in_workforce_pct: number;
}

interface DashboardData {
  overall: Record<string, any>;
  longitudinal: LongitudinalPoint[];
  school_comparison: SchoolComparison[];
}

interface MajorStat {
  major: string;
  school: string;
  total: number;
  placed: number;
  placement_rate: number;
  salary_p50: number | null;
  salary_p25: number | null;
  salary_p75: number | null;
}

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt$ = (v: number | null) => v == null ? 'N/A' : `$${v.toLocaleString()}`;
const fmtPct = (v: number | null) => v == null ? 'N/A' : `${(v as number).toFixed(1)}%`;
const schoolName = (code: string) => SCHOOL_CODE_TO_NAME[code] ?? code;
const shortLabel = (label: string, maxLen = 22) =>
  label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  title: string; value: string; sub?: string; icon: React.ReactNode; color: string;
}> = ({ title, value, sub, icon, color }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
      <Box sx={{ bgcolor: `${color}18`, borderRadius: 2, p: 1.2, color }}>{icon}</Box>
    </Stack>
  </Paper>
);

// ── section wrapper ────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; height?: number }> = ({
  title, subtitle, children, height = 320,
}) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Typography variant="subtitle1" fontWeight={700} gutterBottom>{title}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{subtitle}</Typography>}
    <Box sx={{ height }}>{children}</Box>
  </Paper>
);

// ── custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ p: 1.5, fontSize: '0.8rem', maxWidth: 260 }}>
      {label && <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>{label}</Typography>}
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ color: p.color ?? p.fill, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <span>{p.name}</span>
          <strong>{typeof p.value === 'number' && p.name?.includes('%') ? fmtPct(p.value) : p.name?.includes('$') || p.name?.toLowerCase().includes('salary') ? fmt$(p.value) : p.value}</strong>
        </Box>
      ))}
    </Paper>
  );
};

// ── tab panel ─────────────────────────────────────────────────────────────────
const TabPanel: React.FC<{ value: number; index: number; children: React.ReactNode }> = ({ value, index, children }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardPage: React.FC = () => {
  // ── filter state ────────────────────────────────────────────────────────────
  const [school, setSchool]   = useState('');
  const [majors, setMajors]   = useState<string[]>([]);
  const [terms, setTerms]     = useState<string[]>([]);
  const [allTerms, setAllTerms] = useState<string[]>([]);

  // ── data state ──────────────────────────────────────────────────────────────
  const [data, setData]           = useState<DashboardData | null>(null);
  const [majorData, setMajorData] = useState<MajorStat[] | null>(null);
  const [loading, setLoading]     = useState(false);
  const [majorLoading, setMajorLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── tab state ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState(0);

  // ── load terms once ─────────────────────────────────────────────────────────
  useEffect(() => {
    api.getTerms().then(setAllTerms).catch(() => {});
  }, []);

  // ── fetch dashboard data ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getDashboardData({ major: majors, school, term: terms });
      setData(result as unknown as DashboardData);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [school, majors, terms]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── fetch major data when tab 4 is opened ─────────────────────────────────
  const fetchMajorData = useCallback(async () => {
    if (majorData) return;
    setMajorLoading(true);
    try {
      const result = await api.getMajorComparison({ major: majors, school, term: terms });
      setMajorData(result.majors as unknown as MajorStat[]);
    } catch {
      setMajorData([]);
    } finally {
      setMajorLoading(false);
    }
  }, [majors, school, terms, majorData]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    if (newValue === 4) fetchMajorData();
  };

  const handleApply = () => {
    setMajorData(null); // invalidate so it reloads with new filters
    fetchData();
  };

  // ── derived data ────────────────────────────────────────────────────────────
  const overall   = data?.overall ?? {};
  const longData  = data?.longitudinal ?? [];
  const schoolCmp = data?.school_comparison ?? [];

  const outcomePie = useMemo(() => {
    const outcomes = (overall.outcomes_distribution as Record<string, number>) ?? {};
    return Object.entries(outcomes)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [overall]);

  const stackedOutcomes = useMemo(() => {
    return longData.map(pt => ({
      term: pt.term,
      ...pt.outcomes,
    }));
  }, [longData]);

  const allOutcomeKeys = useMemo(() => {
    const keys = new Set<string>();
    longData.forEach(pt => Object.keys(pt.outcomes).forEach(k => keys.add(k)));
    return Array.from(keys);
  }, [longData]);

  const salaryTrend = useMemo(() =>
    longData.filter(pt => pt.salary_p50 != null).map(pt => ({
      term: pt.term,
      'P25 ($)': pt.salary_p25,
      'Median ($)': pt.salary_p50,
      'P75 ($)': pt.salary_p75,
    })),
  [longData]);

  const placementTrend = useMemo(() =>
    longData.map(pt => ({
      term: pt.term,
      'Placement Rate': pt.placement_rate,
      'Knowledge Rate': pt.knowledge_rate,
      'In Workforce': pt.in_workforce_pct,
    })),
  [longData]);

  const internshipTrend = useMemo(() =>
    longData.map(pt => ({ term: pt.term, 'Internship %': pt.internship_pct })),
  [longData]);

  const cohortTrend = useMemo(() =>
    longData.map(pt => ({ term: pt.term, Graduates: pt.total_graduates })),
  [longData]);

  const responseTrend = useMemo(() =>
    longData.map(pt => ({ term: pt.term, 'Response Rate': pt.survey_response_rate })),
  [longData]);

  const geoData = useMemo(() => {
    const geo = (overall.geographic_distribution as Record<string, number>) ?? {};
    return Object.entries(geo)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [overall]);

  const employerData = useMemo(() => {
    const emp = (overall.top_employers as Array<{ employer: string; count: number }>) ?? [];
    return emp.slice(0, 10).map(e => ({ name: shortLabel(e.employer, 28), count: e.count }));
  }, [overall]);

  const ceInstitutions = useMemo(() => {
    const ce = (overall.continuing_education?.programs as Array<{ institution: string }>) ?? [];
    const cnt: Record<string, number> = {};
    ce.forEach(p => { cnt[p.institution] = (cnt[p.institution] ?? 0) + 1; });
    return Object.entries(cnt)
      .map(([name, count]) => ({ name: shortLabel(name, 30), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [overall]);

  const otherExpData = useMemo(() => {
    const exp = (overall.other_experiences as Record<string, number>) ?? {};
    return Object.entries(exp)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: shortLabel(name, 30), value }))
      .sort((a, b) => b.value - a.value);
  }, [overall]);

  const jobSearchData = useMemo(() => {
    const methods = (overall.job_search_methods as Record<string, number>) ?? {};
    return Object.entries(methods)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: shortLabel(name, 30), value }))
      .sort((a, b) => b.value - a.value);
  }, [overall]);

  const employmentNature = useMemo(() => {
    const nat = (overall.employment_nature as Record<string, number>) ?? {};
    return Object.entries(nat).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [overall]);

  const employmentField = useMemo(() => {
    const fld = (overall.employment_field as Record<string, number>) ?? {};
    return Object.entries(fld).filter(([,v]) => v > 0).map(([name, value]) => ({ name: shortLabel(name, 28), value })).sort((a,b) => b.value - a.value).slice(0, 10);
  }, [overall]);

  // school radar chart
  const radarData = useMemo(() => {
    if (!schoolCmp.length) return [];
    const metrics = ['placement_rate','knowledge_rate','in_workforce_pct'];
    const metricLabels: Record<string, string> = { placement_rate: 'Placement', knowledge_rate: 'Knowledge', in_workforce_pct: 'Workforce' };
    return metrics.map(m => {
      const row: Record<string, any> = { metric: metricLabels[m] };
      schoolCmp.slice(0, 6).forEach(s => { row[schoolName(s.school)] = (s as any)[m] ?? 0; });
      return row;
    });
  }, [schoolCmp]);

  const radarKeys = useMemo(() => schoolCmp.slice(0, 6).map(s => schoolName(s.school)), [schoolCmp]);

  // major scatter
  const majorScatter = useMemo(() => {
    if (!majorData) return [];
    return majorData
      .filter(m => m.salary_p50 != null && m.total > 5)
      .map(m => ({ x: m.total, y: m.salary_p50 as number, z: m.placement_rate, name: m.major }));
  }, [majorData]);

  // coverage / response
  const coverageData = useMemo(() => {
    const rate = overall.survey_response_rate ?? 0;
    const knowledge = overall.knowledge_rate ?? 0;
    return [
      { name: 'Survey Response', value: rate },
      { name: 'Outcome Known', value: knowledge },
      { name: 'Placement Rate', value: overall.placement_rate ?? 0 },
    ];
  }, [overall]);

  const totals = overall.totals as Record<string, number> | undefined;

  // ── filter bar ──────────────────────────────────────────────────────────────
  const FilterBar = (
    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end" flexWrap="wrap">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: UMD_RED }} />
          <Typography fontWeight={700} fontSize="0.9rem">Filters</Typography>
        </Box>

        {/* School */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>School</InputLabel>
          <Select value={school} onChange={e => setSchool(e.target.value as string)} label="School">
            <MenuItem value=""><em>All Schools</em></MenuItem>
            {SCHOOLS.map(s => <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Majors */}
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Major(s)</InputLabel>
          <Select
            multiple
            value={majors}
            onChange={e => setMajors(typeof e.target.value === 'string' ? [e.target.value] : e.target.value as string[])}
            input={<OutlinedInput label="Major(s)" />}
            renderValue={sel => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(sel as string[]).slice(0, 2).map(v => <Chip key={v} label={v} size="small" />)}
                {(sel as string[]).length > 2 && <Chip label={`+${(sel as string[]).length - 2}`} size="small" />}
              </Box>
            )}
          >
            {MAJORS.map(m => <MenuItem key={`${m.schoolCode}-${m.code}`} value={m.code}>{m.name}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Terms */}
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Term(s)</InputLabel>
          <Select
            multiple
            value={terms}
            onChange={e => setTerms(typeof e.target.value === 'string' ? [e.target.value] : e.target.value as string[])}
            input={<OutlinedInput label="Term(s)" />}
            renderValue={sel => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(sel as string[]).slice(0, 3).map(v => <Chip key={v} label={v} size="small" />)}
                {(sel as string[]).length > 3 && <Chip label={`+${(sel as string[]).length - 3}`} size="small" />}
              </Box>
            )}
          >
            {allTerms.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleApply} sx={{ bgcolor: UMD_RED, '&:hover': { bgcolor: '#C41230' }, px: 3 }}>
          Apply
        </Button>
        <Button variant="outlined" onClick={() => { setSchool(''); setMajors([]); setTerms([]); setMajorData(null); }}
          startIcon={<RefreshIcon />} sx={{ borderColor: UMD_RED, color: UMD_RED }}>
          Reset
        </Button>
      </Stack>
    </Paper>
  );

  // ── loading / error ─────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {FilterBar}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: UMD_RED }} size={56} />
        </Box>
      </Container>
    </>
  );

  if (error) return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {FilterBar}
        <Alert severity="error">{error}</Alert>
      </Container>
    </>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page title */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: UMD_NAVY }}>Analytics Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Longitudinal insights across cohorts, outcomes, salary, internships, and more.
          </Typography>
        </Box>

        {FilterBar}

        {/* ── Global KPIs ───────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { title: 'Total Graduates',    value: (totals?.total_graduates ?? 0).toLocaleString(),        sub: 'across selected filters',  icon: <PeopleIcon />,       color: UMD_NAVY },
            { title: 'Placement Rate',     value: fmtPct(overall.placement_rate),                         sub: 'placed among known',        icon: <WorkIcon />,         color: '#10B981' },
            { title: 'Knowledge Rate',     value: fmtPct(overall.knowledge_rate),                         sub: 'outcome known',             icon: <BarChartIcon />,     color: '#3B82F6' },
            { title: 'Median Salary',      value: fmt$(overall.salary?.p50),                              sub: 'full-time employed',        icon: <AttachMoneyIcon />,  color: '#8B5CF6' },
            { title: 'Survey Response',    value: fmtPct(overall.survey_response_rate),                   sub: 'response rate',             icon: <TrendingUpIcon />,   color: UMD_GOLD },
            { title: 'Internship Rate',    value: fmtPct(overall.internships?.pct_had_internship),        sub: 'had ≥1 internship',         icon: <SchoolIcon />,       color: '#F97316' },
          ].map(k => (
            <Grid key={k.title} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard {...k} />
            </Grid>
          ))}
        </Grid>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: '#F8FAFC',
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.85rem' },
              '& .Mui-selected': { color: UMD_RED },
              '& .MuiTabs-indicator': { bgcolor: UMD_RED },
            }}
          >
            <Tab label="Career Outcomes" />
            <Tab label="Salary & Employment" />
            <Tab label="Internships & Experiences" />
            <Tab label="Geographic & Employers" />
            <Tab label="Major Analytics" />
            <Tab label="Data Coverage" />
          </Tabs>

          <Box sx={{ p: 3 }}>

            {/* ════════════════════════════════════════════════════════════════
                TAB 0 — Career Outcomes
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={0}>
              <Grid container spacing={3}>

                {/* Outcome distribution donut */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Outcome Distribution" subtitle="Share of graduates by primary outcome" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={outcomePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={2}>
                          {outcomePie.map((entry, i) => (
                            <Cell key={i} fill={OUTCOME_COLOR[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: '0.75rem' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Placement rate trend */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Placement & Knowledge Rate Trend" subtitle="Longitudinal rates across terms" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={placementTrend} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                        <RTooltip content={<CustomTooltip />} formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        <Legend />
                        <Line type="monotone" dataKey="Placement Rate" stroke={UMD_RED} strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Knowledge Rate" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="In Workforce" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="2 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Stacked outcomes by term */}
                <Grid size={{ xs: 12 }}>
                  <Section title="Outcome Mix by Term" subtitle="Absolute count per outcome category per cohort" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stackedOutcomes} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: '0.73rem' }}>{v}</span>} />
                        {allOutcomeKeys.map((key, i) => (
                          <Bar key={key} dataKey={key} stackId="a" fill={OUTCOME_COLOR[key] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Cohort size */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Section title="Cohort Size by Term" subtitle="Total graduates per reporting term" height={260}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={cohortTrend} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Graduates" fill={`${UMD_RED}22`} stroke={UMD_RED} strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Special outcomes */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Section title="Special Outcome Counts" subtitle="Military, service, entrepreneurship" height={260}>
                    {(() => {
                      const specials = [
                        { name: 'Military', value: (overall.outcomes_distribution as any)?.['Serving in the U.S. Armed Forces'] ?? 0 },
                        { name: 'Volunteer / Service', value: (overall.outcomes_distribution as any)?.['Participating in a volunteer or service program'] ?? 0 },
                        { name: 'Starting a Business', value: (overall.outcomes_distribution as any)?.['Starting a business'] ?? 0 },
                      ].filter(s => s.value > 0);
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={specials} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                            <RTooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </Section>
                </Grid>
              </Grid>
            </TabPanel>

            {/* ════════════════════════════════════════════════════════════════
                TAB 1 — Salary & Employment
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={1}>
              <Grid container spacing={3}>

                {/* Salary KPIs */}
                {[
                  { label: 'P25 Salary', val: fmt$(overall.salary?.p25) },
                  { label: 'Median Salary', val: fmt$(overall.salary?.p50) },
                  { label: 'P75 Salary', val: fmt$(overall.salary?.p75) },
                  { label: 'Mean Salary', val: fmt$(overall.salary?.mean) },
                ].map(k => (
                  <Grid key={k.label} size={{ xs: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#8B5CF6', mt: 0.5 }}>{k.val}</Typography>
                    </Paper>
                  </Grid>
                ))}

                {/* Salary trend */}
                <Grid size={{ xs: 12 }}>
                  <Section title="Salary Percentile Trend" subtitle="P25 / Median / P75 full-time salary across terms" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salaryTrend} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                        <RTooltip formatter={(v: any) => fmt$(v)} />
                        <Legend />
                        <Area type="monotone" dataKey="P25 ($)" fill="#8B5CF620" stroke="#C4B5FD" strokeWidth={1.5} />
                        <Line type="monotone" dataKey="Median ($)" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Area type="monotone" dataKey="P75 ($)" fill="#8B5CF620" stroke="#C4B5FD" strokeWidth={1.5} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Employment modality */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Employment Modality" subtitle="Full-time vs part-time split" height={280}>
                    {(() => {
                      const ftCount = (overall.outcomes_distribution as any)?.['Employed full-time'] ?? 0;
                      const ptCount = (overall.outcomes_distribution as any)?.['Employed part-time'] ?? 0;
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[{ name: 'Full-time', value: ftCount }, { name: 'Part-time', value: ptCount }]}
                              dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                            >
                              <Cell fill="#10B981" />
                              <Cell fill="#34D399" />
                            </Pie>
                            <RTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </Section>
                </Grid>

                {/* Nature of employment */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Nature of Employment" subtitle="Type of work / employer sector" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employmentNature} layout="vertical" margin={{ top: 5, right: 20, left: 140, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Field of employment */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Field of Employment (Top 10)" subtitle="Primary occupational field" height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employmentField} layout="vertical" margin={{ top: 5, right: 20, left: 160, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {employmentField.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Job search methods */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Job Search Methods" subtitle="How graduates found their jobs" height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={jobSearchData} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={UMD_RED} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>
              </Grid>
            </TabPanel>

            {/* ════════════════════════════════════════════════════════════════
                TAB 2 — Internships & Experiences
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={2}>
              <Grid container spacing={3}>
                {/* Internship KPIs */}
                {[
                  { label: 'Had Internship',   val: fmtPct(overall.internships?.pct_had_internship), color: '#F97316' },
                  { label: 'Paid Internship',   val: fmtPct(overall.internships?.paid_pct),           color: '#10B981' },
                  { label: 'Academic Credit',   val: fmtPct(overall.internships?.credit_pct),         color: '#3B82F6' },
                  { label: 'Avg Internships',   val: (overall.internships?.avg_internships ?? 0).toFixed(2), color: '#8B5CF6' },
                ].map(k => (
                  <Grid key={k.label} size={{ xs: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: k.color, mt: 0.5 }}>{k.val}</Typography>
                    </Paper>
                  </Grid>
                ))}

                {/* Internship rate trend */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Internship Rate Over Time" subtitle="% of graduates who had ≥1 internship per cohort" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={internshipTrend} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                        <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        <Area type="monotone" dataKey="Internship %" fill={`#F9731620`} stroke="#F97316" strokeWidth={2.5} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Paid vs Credit */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Paid vs. Credit Internships" subtitle="% of total graduates" height={280}>
                    {(() => {
                      const paidPct = overall.internships?.paid_pct ?? 0;
                      const creditPct = overall.internships?.credit_pct ?? 0;
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[{ category: 'Internship Types', Paid: paidPct, 'Academic Credit': creditPct }]}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                            <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                            <Legend />
                            <Bar dataKey="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Academic Credit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </Section>
                </Grid>

                {/* Out-of-classroom experiences */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Out-of-Classroom Experiences" subtitle="Count of students per experience type" height={340}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={otherExpData} layout="vertical" margin={{ top: 5, right: 20, left: 220, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={220} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {otherExpData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* CE degrees */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Continuing Education Degrees" subtitle="Degree types pursued" height={340}>
                    {(() => {
                      const degrees = (overall.continuing_education?.degrees as Record<string, number>) ?? {};
                      const degData = Object.entries(degrees).filter(([,v]) => v > 0).map(([n, v]) => ({ name: n, value: v })).sort((a,b) => b.value - a.value);
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={degData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={50} paddingAngle={2}>
                              {degData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <RTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: '0.73rem' }}>{v}</span>} />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </Section>
                </Grid>

                {/* CE institutions */}
                <Grid size={{ xs: 12 }}>
                  <Section title="Top Continuing Education Institutions" subtitle="Where graduates continued their studies" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ceInstitutions} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {ceInstitutions.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>
              </Grid>
            </TabPanel>

            {/* ════════════════════════════════════════════════════════════════
                TAB 3 — Geographic & Employers
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={3}>
              <Grid container spacing={3}>

                {/* Geographic distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Section title="Geographic Distribution" subtitle="Location of employed graduates (Top 12)" height={340}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geoData} layout="vertical" margin={{ top: 5, right: 20, left: 130, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={UMD_RED} radius={[0, 4, 4, 0]}>
                          {geoData.map((_, i) => <Cell key={i} fill={i === 0 ? UMD_RED : CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Geography donut */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Section title="Geography Breakdown" subtitle="Top locations as share of placed graduates" height={340}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={geoData.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} innerRadius={55} paddingAngle={2}>
                          {geoData.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <RTooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: '0.73rem' }}>{shortLabel(v, 20)}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Top employers chart */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Top 10 Employers" subtitle="Most common employers among placed graduates" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employerData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill={UMD_NAVY} radius={[4, 4, 0, 0]}>
                          {employerData.map((_, i) => <Cell key={i} fill={i < 3 ? UMD_RED : UMD_NAVY} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* School comparison */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="School Comparison" subtitle="Placement, knowledge & workforce rates" height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={schoolCmp} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="school" tick={{ fontSize: 10 }} tickFormatter={s => schoolName(s)} angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                        <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} labelFormatter={(l: any) => schoolName(String(l))} />
                        <Legend iconSize={9} formatter={(v) => <span style={{ fontSize: '0.75rem' }}>{v}</span>} />
                        <Bar dataKey="placement_rate" name="Placement" fill={UMD_RED} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="knowledge_rate" name="Knowledge" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="in_workforce_pct" name="Workforce" fill="#10B981" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Employer table */}
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>Employer Details</Typography>
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Employer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Graduates</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {((overall.top_employers as Array<{ employer: string; count: number }>) ?? []).map((emp, i) => (
                            <TableRow key={i} hover>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{emp.employer}</TableCell>
                              <TableCell align="right">{emp.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* ════════════════════════════════════════════════════════════════
                TAB 4 — Major Analytics
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={4}>
              {majorLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: UMD_RED }} />
                </Box>
              ) : (
                <Grid container spacing={3}>

                  {/* Placement ranking */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="Placement Rate by Major (Top 15)" subtitle="% placed among known outcomes" height={380}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(majorData ?? []).sort((a, b) => b.placement_rate - a.placement_rate).slice(0, 15).map(m => ({ name: shortLabel(m.major, 22), rate: m.placement_rate, total: m.total }))}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 140, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                          <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                          <Bar dataKey="rate" fill={UMD_RED} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Section>
                  </Grid>

                  {/* Salary ranking */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="Median Salary by Major (Top 15)" subtitle="Full-time employed median salary" height={380}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(majorData ?? []).filter(m => m.salary_p50 != null).sort((a, b) => (b.salary_p50 ?? 0) - (a.salary_p50 ?? 0)).slice(0, 15).map(m => ({ name: shortLabel(m.major, 22), salary: m.salary_p50 }))}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                          <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                          <RTooltip formatter={(v: any) => [fmt$(v)]} />
                          <Bar dataKey="salary" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Section>
                  </Grid>

                  {/* Scatter: salary vs cohort size */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="Salary vs. Cohort Size by Major" subtitle="Bubble size = placement rate; hover for major name" height={320}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis type="number" dataKey="x" name="Cohort Size" tick={{ fontSize: 11 }} label={{ value: 'Graduates', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                          <YAxis type="number" dataKey="y" name="Median Salary" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                          <ZAxis type="number" dataKey="z" range={[40, 400]} name="Placement %" />
                          <RTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <Paper elevation={3} sx={{ p: 1.5, fontSize: '0.78rem' }}>
                                <Typography variant="caption" fontWeight={700} display="block">{d.name}</Typography>
                                <div>Graduates: {d.x}</div>
                                <div>Median Salary: {fmt$(d.y)}</div>
                                <div>Placement Rate: {fmtPct(d.z)}</div>
                              </Paper>
                            );
                          }} />
                          <Scatter data={majorScatter} fill={UMD_RED} opacity={0.75} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </Section>
                  </Grid>

                  {/* School multi-metric radar */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="School Multi-Metric Radar" subtitle="Placement / Knowledge / Workforce rates by school" height={320}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={v => `${v}%`} />
                          {radarKeys.map((key, i) => (
                            <Radar key={key} name={key} dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} />
                          ))}
                          <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ fontSize: '0.75rem' }}>{v}</span>} />
                          <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Section>
                  </Grid>

                  {/* Major detail table */}
                  <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>Major Detail Table</Typography>
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {['Major','School','Graduates','Placed','Placement %','P25 Salary','Median Salary','P75 Salary'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(majorData ?? []).sort((a, b) => b.placement_rate - a.placement_rate).map((m, i) => (
                              <TableRow key={i} hover>
                                <TableCell sx={{ fontSize: '0.78rem' }}>{m.major}</TableCell>
                                <TableCell sx={{ fontSize: '0.78rem' }}>{schoolName(m.school)}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{m.total}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{m.placed}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem', color: m.placement_rate >= 80 ? '#10B981' : m.placement_rate >= 60 ? '#F59E0B' : UMD_RED, fontWeight: 700 }}>
                                  {fmtPct(m.placement_rate)}
                                </TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{fmt$(m.salary_p25)}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{fmt$(m.salary_p50)}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{fmt$(m.salary_p75)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            {/* ════════════════════════════════════════════════════════════════
                TAB 5 — Data Coverage
            ════════════════════════════════════════════════════════════════ */}
            <TabPanel value={tab} index={5}>
              <Grid container spacing={3}>

                {/* Coverage KPIs */}
                {[
                  { label: 'Total Graduates', val: (totals?.total_graduates ?? 0).toLocaleString(),   color: UMD_NAVY },
                  { label: 'Responded',        val: (totals?.responded ?? 0).toLocaleString(),         color: '#3B82F6' },
                  { label: 'Outcome Known',    val: (totals?.knowledge ?? 0).toLocaleString(),         color: '#10B981' },
                  { label: 'Placed',           val: (totals?.placed ?? 0).toLocaleString(),            color: UMD_RED  },
                ].map(k => (
                  <Grid key={k.label} size={{ xs: 6, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: k.color, mt: 0.5 }}>{k.val}</Typography>
                    </Paper>
                  </Grid>
                ))}

                {/* Response rate trend */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Section title="Survey Response Rate Trend" subtitle="% of graduates who responded to the survey per term" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={responseTrend} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                        <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        <Area type="monotone" dataKey="Response Rate" fill={`${UMD_GOLD}40`} stroke={UMD_GOLD} strokeWidth={2.5} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Data completeness */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Section title="Data Completeness" subtitle="Overall coverage funnel" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={coverageData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                        <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          <Cell fill="#3B82F6" />
                          <Cell fill="#10B981" />
                          <Cell fill={UMD_RED} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* Coverage trend — knowledge rate over time */}
                <Grid size={{ xs: 12 }}>
                  <Section title="Knowledge Rate & Placement Rate by Term" subtitle="Longitudinal view of data quality and outcomes" height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={placementTrend} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                        <RTooltip formatter={(v: any) => [`${v.toFixed(1)}%`]} />
                        <Legend />
                        <Line type="monotone" dataKey="Knowledge Rate" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Placement Rate" stroke={UMD_RED} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Section>
                </Grid>

                {/* School coverage table */}
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>Coverage by School</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['School','Total Graduates','Placement Rate','Knowledge Rate','In Workforce %'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {schoolCmp.map((s, i) => (
                            <TableRow key={i} hover>
                              <TableCell>{schoolName(s.school)}</TableCell>
                              <TableCell align="right">{s.total.toLocaleString()}</TableCell>
                              <TableCell align="right" sx={{ color: s.placement_rate >= 80 ? '#10B981' : s.placement_rate >= 60 ? '#F59E0B' : UMD_RED, fontWeight: 700 }}>
                                {fmtPct(s.placement_rate)}
                              </TableCell>
                              <TableCell align="right">{fmtPct(s.knowledge_rate)}</TableCell>
                              <TableCell align="right">{fmtPct(s.in_workforce_pct)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

          </Box>
        </Paper>
      </Container>
    </>
  );
};
