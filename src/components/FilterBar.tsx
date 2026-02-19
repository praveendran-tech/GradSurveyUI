import React from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { FilterValues } from '../types';
import { SCHOOLS, MAJORS, SCHOOL_CODE_TO_NAME } from '../majorData';

interface FilterBarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

const SOURCE_OPTIONS = [
  { value: 'qualtrics', label: 'Qualtrics', color: '#1976D2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'clearinghouse', label: 'ClearingHouse', color: '#4CAF50' },
  { value: 'no-source', label: 'No Source', color: '#9E9E9E' },
];

const TERM_OPTIONS = [
  '202501', '202508', '202412', '202408', '202401',
  '202312', '202308', '202301', '202212', '202208', '202201',
  '202112', '202108', '202101',
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleTextField = (field: keyof FilterValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({ ...filters, [field]: event.target.value });
  };

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    if (field === 'school') {
      // Changing school clears major if it doesn't belong to new school
      const majorStillValid = MAJORS.some(
        (m) => m.schoolCode === value && m.code === filters.major
      );
      onFilterChange({
        ...filters,
        school: value,
        major: majorStillValid ? filters.major : '',
      });
    } else if (field === 'major') {
      // Selecting a major auto-selects its school
      const majorEntry = MAJORS.find((m) => m.code === value);
      onFilterChange({
        ...filters,
        major: value,
        school: majorEntry ? majorEntry.schoolCode : filters.school,
      });
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleSourcesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      sources: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Majors filtered by selected school (or all if no school selected)
  const availableMajors = filters.school
    ? MAJORS.filter((m) => m.schoolCode === filters.school)
    : MAJORS;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      background: 'white',
      borderRadius: 1.5,
    },
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '6px',
          background: 'linear-gradient(180deg, #E21833 0%, #FFD200 100%)',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(226, 24, 51, 0.3)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            🔍
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #E21833 0%, #666666 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Filter Students
        </Typography>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Name — free text */}
        <Box flex="1 1 180px">
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={filters.name}
            onChange={handleTextField('name')}
            size="small"
            sx={fieldSx}
          />
        </Box>

        {/* UID — free text */}
        <Box flex="1 1 150px">
          <TextField
            fullWidth
            label="UID"
            variant="outlined"
            value={filters.uid}
            onChange={handleTextField('uid')}
            size="small"
            sx={fieldSx}
          />
        </Box>

        {/* School dropdown */}
        <Box flex="1 1 220px">
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>School</InputLabel>
            <Select
              value={filters.school}
              label="School"
              onChange={handleSelect('school')}
              renderValue={(val) =>
                val ? (SCHOOL_CODE_TO_NAME[val] ?? val) : ''
              }
            >
              <MenuItem value=""><em>All Schools</em></MenuItem>
              {SCHOOLS.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Major dropdown — filtered by school */}
        <Box flex="1 1 280px">
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Major</InputLabel>
            <Select
              value={filters.major}
              label="Major"
              onChange={handleSelect('major')}
              renderValue={(val) => {
                const entry = MAJORS.find((m) => m.code === val);
                return entry ? entry.name : val;
              }}
            >
              <MenuItem value=""><em>All Majors</em></MenuItem>
              {availableMajors.map((m) => (
                <MenuItem key={`${m.schoolCode}-${m.code}`} value={m.code}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Term dropdown */}
        <Box flex="1 1 160px">
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Term</InputLabel>
            <Select
              value={filters.term}
              label="Term"
              onChange={handleSelect('term')}
            >
              <MenuItem value=""><em>All Terms</em></MenuItem>
              {TERM_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Data Sources multi-select */}
        <Box flex="1 1 250px">
          <FormControl fullWidth size="small">
            <InputLabel id="sources-label">Data Sources</InputLabel>
            <Select
              labelId="sources-label"
              multiple
              value={filters.sources}
              onChange={handleSourcesChange}
              input={<OutlinedInput label="Data Sources" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const option = SOURCE_OPTIONS.find((opt) => opt.value === value);
                    return (
                      <Chip
                        key={value}
                        label={option?.label}
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${option?.color} 0%, ${option?.color}DD 100%)`,
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: option.color,
                      }}
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
};
