import React, { useState, useEffect } from 'react';
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
  termOptions: string[];
}

const SOURCE_OPTIONS = [
  { value: 'qualtrics', label: 'Qualtrics', color: '#1976D2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'clearinghouse', label: 'ClearingHouse', color: '#4CAF50' },
  { value: 'no-source', label: 'No Source', color: '#9E9E9E' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, termOptions }) => {
  // Local state for text inputs — committed to parent on Enter or blur
  const [localName, setLocalName] = useState(filters.name);
  const [localUid, setLocalUid] = useState(filters.uid);

  // Keep local values in sync when parent resets filters
  useEffect(() => { setLocalName(filters.name); }, [filters.name]);
  useEffect(() => { setLocalUid(filters.uid); }, [filters.uid]);

  const commitName = () => onFilterChange({ ...filters, name: localName });
  const commitUid = () => onFilterChange({ ...filters, uid: localUid });

  const handleSelect = (field: keyof FilterValues) => (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (field === 'school') {
      // Changing school clears any selected majors that don't belong to new school
      const validMajorCodes = new Set(MAJORS.filter(m => m.schoolCode === value).map(m => m.code));
      onFilterChange({
        ...filters,
        school: value,
        major: value ? filters.major.filter(code => validMajorCodes.has(code)) : filters.major,
      });
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleMajorChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      major: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleTermChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      term: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSourcesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      sources: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Majors filtered by selected school (or all if no school selected), sorted alphabetically, deduplicated by name
  const availableMajors = (filters.school
    ? MAJORS.filter((m) => m.schoolCode === filters.school)
    : MAJORS
  ).slice().sort((a, b) => a.name.localeCompare(b.name)).filter(
    (m, idx, arr) => idx === 0 || m.name !== arr[idx - 1].name
  );

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
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === 'Enter' && commitName()}
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
            value={localUid}
            onChange={(e) => setLocalUid(e.target.value)}
            onBlur={commitUid}
            onKeyDown={(e) => e.key === 'Enter' && commitUid()}
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

        {/* Major multi-select — filtered by school, sorted A–Z */}
        <Box flex="1 1 280px">
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel id="major-label">Major</InputLabel>
            <Select
              labelId="major-label"
              multiple
              value={filters.major}
              onChange={handleMajorChange}
              input={<OutlinedInput label="Major" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((code) => {
                    const entry = MAJORS.find((m) => m.code === code);
                    return (
                      <Chip
                        key={code}
                        label={entry ? entry.name : code}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(226,24,51,0.1)', color: '#E21833' }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableMajors.map((m) => (
                <MenuItem key={`${m.schoolCode}-${m.code}`} value={m.code}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Term multi-select */}
        <Box flex="1 1 200px">
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel id="term-label">Term</InputLabel>
            <Select
              labelId="term-label"
              multiple
              value={filters.term}
              onChange={handleTermChange}
              input={<OutlinedInput label="Term" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(226,24,51,0.1)', color: '#E21833' }}
                    />
                  ))}
                </Box>
              )}
            >
              {termOptions.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Data Sources multi-select */}
        <Box flex="1 1 250px">
          <FormControl fullWidth size="small" sx={fieldSx}>
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
                          fontWeight: 600,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '4px',
                        background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}DD 100%)`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>{option.label}</Typography>
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
