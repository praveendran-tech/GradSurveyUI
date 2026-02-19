import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { QualtricsData, LinkedInData, ClearingHouseData } from '../types';
import { ViewDetailDialog } from './ViewDetailDialog';

interface DataSourceCardProps {
  type: 'qualtrics' | 'linkedin' | 'clearinghouse';
  data: QualtricsData | LinkedInData | ClearingHouseData;
  onSelect: (type: 'qualtrics' | 'linkedin' | 'clearinghouse') => void;
  isSelected?: boolean;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  type,
  data,
  onSelect,
  isSelected = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'qualtrics':
        return 'Qualtrics Survey';
      case 'linkedin':
        return 'LinkedIn Profile';
      case 'clearinghouse':
        return 'ClearingHouse Record';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'qualtrics':
        return '#1976D2'; // Blue
      case 'linkedin':
        return '#0A66C2'; // LinkedIn Blue
      case 'clearinghouse':
        return '#4CAF50'; // Green
    }
  };

  const getSummary = () => {
    switch (type) {
      case 'qualtrics':
        const qualtricsData = data as QualtricsData;
        return `Survey ID: ${qualtricsData.surveyId}`;
      case 'linkedin':
        const linkedInData = data as LinkedInData;
        return `${linkedInData.positions.length} position(s), ${linkedInData.education.length} education record(s)`;
      case 'clearinghouse':
        const clearingHouseData = data as ClearingHouseData;
        return `${clearingHouseData.enrollmentRecords.length} enrollment record(s)`;
    }
  };

  return (
    <>
      <Card
        sx={{
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(226, 24, 51, 0.03) 0%, rgba(255, 255, 255, 1) 100%)'
            : 'white',
          '&:hover': {
            boxShadow: isSelected ? 8 : 6,
            transform: 'translateY(-4px) scale(1.02)',
          },
          '&::after': isSelected
            ? {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(135deg, #E21833, #FFD200)',
                borderRadius: 'inherit',
                zIndex: -1,
                opacity: 0.3,
                filter: 'blur(8px)',
              }
            : {},
        }}
      >
        <Box
          sx={{
            height: 4,
            bgcolor: getColor(),
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">
              {getTitle()}
            </Typography>
            {isSelected && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Selected"
                color="primary"
                size="small"
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {getSummary()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Sourced: {new Date(data.sourcedTime).toLocaleString()}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => setDialogOpen(true)}
          >
            View
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onSelect(type)}
            disabled={isSelected}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </CardActions>
      </Card>

      <ViewDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        data={data}
        type={type}
      />
    </>
  );
};
