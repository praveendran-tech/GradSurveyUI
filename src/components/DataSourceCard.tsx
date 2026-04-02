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
  disabled?: boolean;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  type,
  data,
  onSelect,
  isSelected = false,
  disabled = false,
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

  const hasValidStatus = (): boolean => {
    const isNonEmpty = (val: unknown) =>
      val != null && String(val).trim() !== '' && String(val).toUpperCase() !== 'NULL';

    switch (type) {
      case 'qualtrics':
        return isNonEmpty((data as QualtricsResponse).payload?.STATUS);
      case 'linkedin':
        return isNonEmpty((data as LinkedInPosition).payload?.status);
      case 'clearinghouse': {
        const p = (data as ClearingHouseRecord).payload;
        return isNonEmpty(p?.['College Name']) || isNonEmpty(p?.['Degree Title']) || isNonEmpty(p?.['Enrollment Major 1']) || isNonEmpty(p?.['Class Level']);
      }
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

        const classLevel = clearingHouseData.payload?.['Class Level'];
        const CLASS_LEVEL_MAP: Record<string, string> = {
          F: 'Freshman', S: 'Sophomore', J: 'Junior', R: 'Senior',
          C: 'Certificate', N: 'Unspecified (UG)', B: "Bachelor's",
          M: "Master's", D: "Doctor's", P: 'Postdoctorate',
          L: 'First Professional', G: 'Unspecified (Grad)', A: "Associate's",
          T: 'Post Baccalaureate Certificate',
        };
        const classLevelLabel = classLevel ? (CLASS_LEVEL_MAP[String(classLevel).toUpperCase()] ?? classLevel) : null;

        const parts = [];
        if (collegeName) parts.push(`College Name: ${collegeName}`);
        if (enrollmentMajor) parts.push(`Enrollment Major 1: ${enrollmentMajor}`);
        if (classLevelLabel) parts.push(`Class Level: ${classLevelLabel}`);

        return parts.length > 0 ? parts.join(' | ') : 'N/A';
    }
  };

  const validStatus = hasValidStatus();

  return (
    <>
      <Card
        sx={{
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : validStatus ? 'divider' : 'rgba(0,0,0,0.1)',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(226, 24, 51, 0.03) 0%, rgba(255, 255, 255, 1) 100%)'
            : validStatus ? 'white' : 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
          opacity: validStatus ? 1 : 0.8,
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
            bgcolor: validStatus ? getColor() : '#9E9E9E',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div" sx={{ color: validStatus ? 'inherit' : 'text.secondary' }}>
              {getTitle()}
            </Typography>
            {isSelected && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Approved"
                color="primary"
                size="small"
              />
            )}
            {!isSelected && !validStatus && (
              <Chip
                label="No Status"
                size="small"
                sx={{ bgcolor: '#9E9E9E', color: 'white', fontSize: '0.7rem', height: 22 }}
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
          {hasValidStatus() && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onSelect(type)}
              disabled={isSelected || disabled}
            >
              {isSelected ? 'Approved' : disabled ? 'Saving…' : 'Approve'}
            </Button>
          )}
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
