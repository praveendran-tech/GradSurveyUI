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
import type {
  QualtricsResponse,
  LinkedInPosition,
  ClearingHouseRecord
} from '../types';
import { ViewDetailDialog } from './ViewDetailDialog';

interface DataSourceCardProps {
  type: 'qualtrics' | 'linkedin' | 'clearinghouse';
  data: QualtricsResponse | LinkedInPosition | ClearingHouseRecord;
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
        const qualtricsData = data as QualtricsResponse;
        return `Survey ID: ${qualtricsData.survey_id || 'N/A'}`;
      case 'linkedin':
        const linkedInData = data as LinkedInPosition;
        const linkedinUrl = linkedInData.payload?.linkedin_url || linkedInData.payload?.url || linkedInData.payload?.profile_url;
        return `URL: ${linkedinUrl || 'N/A'}`;
      case 'clearinghouse':
        const clearingHouseData = data as ClearingHouseRecord;
        const collegeName = clearingHouseData.payload?.['College Name'] ||
                           clearingHouseData.payload?.college_name ||
                           clearingHouseData.payload?.institution ||
                           clearingHouseData.payload?.school;
        const enrollmentMajor = clearingHouseData.payload?.['Enrollment Major 1'] ||
                               clearingHouseData.payload?.enrollment_major_1 ||
                               clearingHouseData.payload?.major ||
                               clearingHouseData.payload?.program ||
                               clearingHouseData.payload?.degree_major;

        const parts = [];
        if (collegeName) parts.push(`College Name: ${collegeName}`);
        if (enrollmentMajor) parts.push(`Enrollment Major 1: ${enrollmentMajor}`);

        return parts.length > 0 ? parts.join(' | ') : 'N/A';
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
            {type === 'qualtrics'
              ? `Recorded: ${new Date((data as QualtricsResponse).recorded_at).toLocaleString()}`
              : `Source: ${(data as LinkedInPosition | ClearingHouseRecord).source_file}`}
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
