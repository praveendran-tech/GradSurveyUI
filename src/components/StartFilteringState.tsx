import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const StartFilteringState: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 12,
        px: 3,
      }}
    >
      {/* Animated Icons */}
      <Box
        sx={{
          position: 'relative',
          width: 200,
          height: 200,
          margin: '0 auto',
          mb: 4,
        }}
      >
        {/* Outer rotating circle */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px dashed',
            borderColor: 'primary.main',
            opacity: 0.3,
            animation: `${rotate} 20s linear infinite`,
          }}
        />

        {/* Middle pulsing circle */}
        <Box
          sx={{
            position: 'absolute',
            inset: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(255, 210, 0, 0.1) 100%)',
            animation: `${pulse} 3s ease-in-out infinite`,
          }}
        />

        {/* Center floating icon */}
        <Box
          sx={{
            position: 'absolute',
            inset: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(226, 24, 51, 0.4)',
            animation: `${float} 4s ease-in-out infinite`,
          }}
        >
          <FilterListIcon sx={{ fontSize: 50, color: 'white' }} />
        </Box>

        {/* Floating accent icons */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          <SearchIcon sx={{ fontSize: 24, color: 'white' }} />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD200 0%, #FFC107 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 210, 0, 0.3)',
            animation: `${float} 3.5s ease-in-out infinite`,
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 24, color: '#000' }} />
        </Box>
      </Box>

      {/* Message */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #E21833 0%, #FFD200 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        Start Your Search
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        paragraph
        sx={{ maxWidth: 500, margin: '0 auto', mb: 3, lineHeight: 1.6 }}
      >
        Use the filters above to search for students by name, UID, major, school, or term
      </Typography>

      {/* Instructions */}
      <Box
        sx={{
          maxWidth: 600,
          margin: '0 auto',
          mt: 4,
          p: 3,
          background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          💡 Quick Tips:
        </Typography>
        <Box textAlign="left" sx={{ pl: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Enter any part of a name to search (e.g., "John" or "Smith")
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Type a UID to find a specific student
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Filter by major or school to see program-specific results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Combine multiple filters for precise searches
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
