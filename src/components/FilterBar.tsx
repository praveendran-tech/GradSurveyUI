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

interface FilterBarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

const SOURCE_OPTIONS = [
  { value: 'qualtrics', label: 'Qualtrics', color: '#1976D2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'clearinghouse', label: 'ClearingHouse', color: '#4CAF50' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleChange = (field: keyof FilterValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleSourcesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      sources: typeof value === 'string' ? value.split(',') : value,
    });
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
        <Box flex="1 1 200px">
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={filters.name}
            onChange={handleChange('name')}
            size="small"
          />
        </Box>
        <Box flex="1 1 200px">
          <TextField
            fullWidth
            label="UID"
            variant="outlined"
            value={filters.uid}
            onChange={handleChange('uid')}
            size="small"
          />
        </Box>
        <Box flex="1 1 200px">
          <TextField
            fullWidth
            label="Major"
            variant="outlined"
            value={filters.major}
            onChange={handleChange('major')}
            size="small"
          />
        </Box>
        <Box flex="1 1 200px">
          <TextField
            fullWidth
            label="School"
            variant="outlined"
            value={filters.school}
            onChange={handleChange('school')}
            size="small"
          />
        </Box>
        <Box flex="1 1 200px">
          <TextField
            fullWidth
            label="Term"
            variant="outlined"
            value={filters.term}
            onChange={handleChange('term')}
            size="small"
          />
        </Box>
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
                    const option = SOURCE_OPTIONS.find(opt => opt.value === value);
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
