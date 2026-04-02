import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const STATUS_OPTIONS = [
  { value: 'employed-ft',           label: 'Employed Full-Time',    outcome: 'Employed full-time' },
  { value: 'employed-pt',           label: 'Employed Part-Time',    outcome: 'Employed part-time' },
  { value: 'continuing-education',  label: 'Continuing Education',  outcome: 'Continuing education' },
  { value: 'volunteering',          label: 'Volunteering',          outcome: 'Volunteering' },
  { value: 'military',              label: 'Military',              outcome: 'Serving in the U.S. Armed Forces' },
  { value: 'starting-business',     label: 'Starting a Business',   outcome: 'Starting a business' },
];

const EMPTY_FORM = {
  date: '',
  status: '',
  dataSource: '',
  // Employed
  employerName: '',
  employerCity: '',
  employerState: '',
  employerCountry: '',
  jobTitle: '',
  linkedinUrl: '',
  // Continuing Education
  contEduInstitution: '',
  contEduCountry: '',
  contEduCity: '',
  contEduState: '',
  contEduProgram: '',
  contEduDegree: '',
  contEduModality: '',
  // Volunteering
  volunteerOrg: '',
  volunteerCountry: '',
  volunteerCity: '',
  volunteerState: '',
  volunteerRole: '',
  // Military
  militaryBranch: '',
  militaryRank: '',
  // Business
  businessName: '',
  businessPositionTitle: '',
  businessCountry: '',
  businessCity: '',
  businessState: '',
  businessDescription: '',
};

type FormData = typeof EMPTY_FORM;

function buildPayload(form: FormData): Record<string, unknown> {
  const statusEntry = STATUS_OPTIONS.find((s) => s.value === form.status);
  const outcome_status = statusEntry?.outcome ?? form.status;

  const payload: Record<string, unknown> = {
    outcome_status,
    selected_source: 'manual',
    data_source: form.dataSource || null,
    outcome_recorded_date: form.date || null,
  };

  switch (form.status) {
    case 'employed-ft':
    case 'employed-pt':
      payload.employer_name    = form.employerName    || null;
      payload.employer_city    = form.employerCity    || null;
      payload.employer_state   = form.employerState   || null;
      payload.employer_country = form.employerCountry || null;
      payload.job_title        = form.jobTitle        || null;
      payload.linkedin_profile_url = form.linkedinUrl || null;
      break;
    case 'continuing-education':
      payload.continuing_education_institution = form.contEduInstitution || null;
      payload.continuing_education_country     = form.contEduCountry     || null;
      payload.continuing_education_city        = form.contEduCity        || null;
      payload.continuing_education_state       = form.contEduState       || null;
      payload.continuing_education_program     = form.contEduProgram     || null;
      payload.continuing_education_degree      = form.contEduDegree      || null;
      payload.employment_modality              = form.contEduModality    || null;
      break;
    case 'volunteering':
      payload.volunteer_organization = form.volunteerOrg     || null;
      payload.volunteer_country      = form.volunteerCountry || null;
      payload.volunteer_city         = form.volunteerCity    || null;
      payload.volunteer_state        = form.volunteerState   || null;
      payload.volunteer_role         = form.volunteerRole    || null;
      break;
    case 'military':
      payload.military_branch = form.militaryBranch || null;
      payload.military_rank   = form.militaryRank   || null;
      break;
    case 'starting-business':
      payload.business_name           = form.businessName          || null;
      payload.business_position_title = form.businessPositionTitle || null;
      payload.business_country        = form.businessCountry       || null;
      payload.business_city           = form.businessCity          || null;
      payload.business_state          = form.businessState         || null;
      payload.business_description    = form.businessDescription   || null;
      break;
  }

  return payload;
}

interface AddManuallyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  studentId: string;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    background: 'white',
    borderRadius: 2,
    '& fieldset': { borderColor: '#e8e8e8' },
    '&:hover fieldset': { borderColor: '#E21833' },
    '&.Mui-focused fieldset': { borderColor: '#E21833', borderWidth: 2 },
  },
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, pb: 1.5, borderBottom: '2px solid #f0f0f0' }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
      {children}
    </Typography>
  </Box>
);

export const AddManuallyDialog: React.FC<AddManuallyDialogProps> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'status') {
      setForm({ ...EMPTY_FORM, date: form.date, dataSource: form.dataSource, status: e.target.value });
    } else {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleSave = () => {
    onSave(buildPayload(form));
    handleClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const isEmployed = form.status === 'employed-ft' || form.status === 'employed-pt';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
          color: 'white',
          py: 3.5,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 2.5,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>
              Add Manual Entry
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.875rem' }}>
              Enter student outcome information manually
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white', position: 'relative', zIndex: 1, width: 40, height: 40,
            '&:hover': { background: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 4, background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
        <Stack spacing={4} sx={{ mt: 0.5 }}>

          {/* ── Core fields (always shown) ── */}
          <Box>
            <SectionHeader>Entry Details</SectionHeader>
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={set('date')}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={set('status')}
                sx={fieldSx}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Data Source"
                placeholder="e.g. LinkedIn, Email, Phone..."
                value={form.dataSource}
                onChange={set('dataSource')}
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* ── Employed FT / PT ── */}
          {isEmployed && (
            <Box>
              <SectionHeader>Employment Information</SectionHeader>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField fullWidth label="Name of Employer"   value={form.employerName}    onChange={set('employerName')}    sx={fieldSx} />
                <TextField fullWidth label="Job Title"          value={form.jobTitle}         onChange={set('jobTitle')}         sx={fieldSx} />
                <TextField fullWidth label="Employer City"      value={form.employerCity}     onChange={set('employerCity')}     sx={fieldSx} />
                <TextField fullWidth label="Employer State"     value={form.employerState}    onChange={set('employerState')}    sx={fieldSx} />
                <TextField fullWidth label="Employer Country"   value={form.employerCountry}  onChange={set('employerCountry')}  sx={fieldSx} />
                <TextField fullWidth label="LinkedIn URL"       value={form.linkedinUrl}      onChange={set('linkedinUrl')}      sx={fieldSx} />
              </Box>
            </Box>
          )}

          {/* ── Continuing Education ── */}
          {form.status === 'continuing-education' && (
            <Box>
              <SectionHeader>Continuing Education Information</SectionHeader>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField fullWidth label="Continuing Education Institution" value={form.contEduInstitution} onChange={set('contEduInstitution')} sx={fieldSx} />
                <TextField fullWidth label="Continuing Education Program"     value={form.contEduProgram}     onChange={set('contEduProgram')}     sx={fieldSx} />
                <TextField fullWidth label="Continuing Education Degree"      value={form.contEduDegree}      onChange={set('contEduDegree')}      sx={fieldSx} />
                <TextField fullWidth label="Modality (Hybrid etc. if known)"  value={form.contEduModality}    onChange={set('contEduModality')}    sx={fieldSx} />
                <TextField fullWidth label="Continuing Education City"        value={form.contEduCity}        onChange={set('contEduCity')}        sx={fieldSx} />
                <TextField fullWidth label="Continuing Education State"       value={form.contEduState}       onChange={set('contEduState')}       sx={fieldSx} />
                <TextField fullWidth label="Continuing Education Country"     value={form.contEduCountry}     onChange={set('contEduCountry')}     sx={fieldSx} />
              </Box>
            </Box>
          )}

          {/* ── Volunteering ── */}
          {form.status === 'volunteering' && (
            <Box>
              <SectionHeader>Volunteer Information</SectionHeader>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField fullWidth label="Volunteer Organization"         value={form.volunteerOrg}     onChange={set('volunteerOrg')}     sx={fieldSx} />
                <TextField fullWidth label="Volunteer Role"                 value={form.volunteerRole}    onChange={set('volunteerRole')}    sx={fieldSx} />
                <TextField fullWidth label="Volunteer City"                 value={form.volunteerCity}    onChange={set('volunteerCity')}    sx={fieldSx} />
                <TextField fullWidth label="Volunteer State"                value={form.volunteerState}   onChange={set('volunteerState')}   sx={fieldSx} />
                <TextField fullWidth label="Volunteer Organization Country"  value={form.volunteerCountry} onChange={set('volunteerCountry')} sx={fieldSx} />
              </Box>
            </Box>
          )}

          {/* ── Military ── */}
          {form.status === 'military' && (
            <Box>
              <SectionHeader>Military Service Information</SectionHeader>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField fullWidth label="Joined Military Branch" value={form.militaryBranch} onChange={set('militaryBranch')} sx={fieldSx} />
                <TextField fullWidth label="Military Rank"          value={form.militaryRank}   onChange={set('militaryRank')}   sx={fieldSx} />
              </Box>
            </Box>
          )}

          {/* ── Starting a Business ── */}
          {form.status === 'starting-business' && (
            <Box>
              <SectionHeader>Business Information</SectionHeader>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField fullWidth label="Name of Started Business"        value={form.businessName}          onChange={set('businessName')}          sx={fieldSx} />
                <TextField fullWidth label="Started Business Position Title"  value={form.businessPositionTitle} onChange={set('businessPositionTitle')} sx={fieldSx} />
                <TextField fullWidth label="Started Business City"            value={form.businessCity}          onChange={set('businessCity')}          sx={fieldSx} />
                <TextField fullWidth label="Started Business State"           value={form.businessState}         onChange={set('businessState')}         sx={fieldSx} />
                <TextField fullWidth label="Started Business Country"         value={form.businessCountry}       onChange={set('businessCountry')}       sx={fieldSx} />
                <TextField
                  fullWidth
                  label="Started Business Description"
                  value={form.businessDescription}
                  onChange={set('businessDescription')}
                  multiline
                  rows={3}
                  sx={{ ...fieldSx, gridColumn: { sm: '1 / -1' } }}
                />
              </Box>
            </Box>
          )}

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, background: 'white', borderTop: '1px solid #f0f0f0', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          sx={{
            px: 4, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
            borderWidth: 2, borderColor: '#e8e8e8', color: '#666',
            '&:hover': { borderWidth: 2, borderColor: '#E21833', color: '#E21833', background: 'rgba(226,24,51,0.03)' },
            transition: 'all 0.3s ease',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!form.status}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
            px: 5, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(226,24,51,0.2)',
            '&:hover': { background: 'linear-gradient(135deg, #C41230 0%, #A01028 100%)', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(226,24,51,0.35)' },
            '&:disabled': { background: '#ccc' },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Save Entry
        </Button>
      </DialogActions>
    </Dialog>
  );
};
