import React from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RefreshIcon from '@mui/icons-material/Refresh';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

interface EmptyStateProps {
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 10,
        px: 3,
      }}
    >
      <Box
        sx={{
          animation: `${float} 3s ease-in-out infinite`,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 150,
            height: 150,
            margin: '0 auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(255, 210, 0, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -20,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
              animation: `${pulse} 2s ease-in-out infinite`,
            },
          }}
        >
          <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        No Students Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ maxWidth: 400, margin: '0 auto', mb: 4 }}
      >
        We couldn't find any students matching your current filters. Try adjusting your search
        criteria or reset the filters.
      </Typography>

      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={onReset}
        sx={{
          px: 4,
          py: 1.5,
          background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(226, 24, 51, 0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Reset Filters
      </Button>
    </Box>
  );
};
