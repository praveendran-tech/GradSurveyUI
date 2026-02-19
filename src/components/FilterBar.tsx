import React from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
} from '@mui/material';
import type { FilterValues } from '../types';

interface FilterBarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleChange = (field: keyof FilterValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value,
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
      </Box>
    </Paper>
  );
};
