import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PollIcon from '@mui/icons-material/Poll';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SchoolIcon from '@mui/icons-material/School';
import type {
  QualtricsResponse,
  LinkedInPosition,
  ClearingHouseRecord,
} from '../types';

interface ViewDetailDialogProps {
  open: boolean;
  onClose: () => void;
  data: QualtricsResponse | LinkedInPosition | ClearingHouseRecord | null;
  type: 'qualtrics' | 'linkedin' | 'clearinghouse';
}

export const ViewDetailDialog: React.FC<ViewDetailDialogProps> = ({
  open,
  onClose,
  data,
  type,
}) => {
  if (!data) return null;

  const renderSourceFileField = (sourceFile: string) => (
    <Box
      sx={{
        mb: 3,
        p: 2,
        background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(226, 24, 51, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Source File:
      </Typography>
      <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ wordBreak: 'break-all' }}>
        {sourceFile || 'N/A'}
      </Typography>
    </Box>
  );

  const renderQualtricsData = (qualtricsData: QualtricsResponse) => {
    // Only show these specific fields from the AWS headers reference
    const allowedFields = [
      'ExternalDataReference',
      'EndDate',
      'STATUS',
      'Qualtrics',
      'STBUS_ORG',
      'STBUS_CONTACT',
      'STBUS_PURPOSE',
      'STBUS_YRSTARTED',
      'VOL_ORG',
      'VOL_COUNTRY',
      'MIL_BRANCH',
      'MIL_RANK',
      'CONTEDU_INST',
      'CONTEDU_PROGRAM',
      'CONTEDU_DEGREE',
      'EMP_JobSite',
      'EMP_ORG',
      'EMP_CITY',
      'EMP_STATE',
      'EMP_COUNTRY',
      'EMP_TITLE',
      'LinkedIn Profile',
    ];

    // Show only allowed fields with non-null values
    const filteredEntries = allowedFields
      .map(key => [key, qualtricsData.payload[key]] as [string, unknown])
      .filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (String(value).toUpperCase() === 'NULL') return false;
        return true;
      });

    return (
      <Box>
        {renderSourceFileField(qualtricsData.source_file)}
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          {filteredEntries.map(([key, value]) => (
            <Box
              key={key}
              sx={{
                p: 3,
                background: 'white',
                borderRadius: 3,
                border: '1px solid #e8e8e8',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #E21833 0%, #FFD200 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderColor: '#E21833',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#E21833',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block',
                }}
              >
                {key}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2c2c2c', lineHeight: 1.6 }}>
                {String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderLinkedInData = (linkedInData: LinkedInPosition) => {
    // Label → actual payload key mapping
    const fieldMap: [string, string][] = [
      ['U_Id', 'u_id'],
      ['Date', 'date_doubleclick'],
      ['Status', 'status'],
      ['Data Source', 'data_source'],
      ['Name of Started Business', 'name_of_started_business'],
      ['Started Business Position Title', 'started_business_position_title'],
      ['Started Business Country', 'started_business_country'],
      ['Started Business City', 'started_business_city'],
      ['Started Business State', 'started_business_state'],
      ['Started Business Description', 'started_business_description'],
      ['Volunteer Organization', 'volunteer_organization'],
      ['Volunteer Organization Country', 'volunteer_organization_country'],
      ['Volunteer City', 'volunteer_city'],
      ['Volunteer State', 'volunteer_state'],
      ['Volunteer Role', 'volunteer_role'],
      ['Joined Military Branch', 'joined_military_branch'],
      ['Military Rank', 'military_rank'],
      ['Continuing Education Institution', 'continuing_education_institution'],
      ['Continuing Education Country', 'continuing_education_country'],
      ['Continuing Education City', 'continuing_education_city'],
      ['Continuing Education State', 'continuing_education_state'],
      ['Continuing Education Program', 'continuing_education_program'],
      ['Continuing Education Degree', 'continuing_education_degree'],
      ['Modality (Hybrid etc.if known)', 'modality_(hybrid_etc.if_known)'],
      ['Name of Employer', 'name_of_employer'],
      ['Employer City', 'employer_city'],
      ['Employer State', 'employer_state'],
      ['Employer Country', 'employer_country'],
      ['Job Title', 'job_title'],
      ['LinkedIn URL', 'linkedin_url'],
    ];

    // Show only fields with non-null values
    const filteredEntries = fieldMap
      .map(([label, key]) => [label, linkedInData.payload[key]] as [string, unknown])
      .filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (String(value).toUpperCase() === 'NULL') return false;
        return true;
      });

    return (
      <Box>
        {renderSourceFileField(linkedInData.source_file)}
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          {filteredEntries.map(([key, value]) => (
            <Box
              key={key}
              sx={{
                p: 3,
                background: 'white',
                borderRadius: 3,
                border: '1px solid #e8e8e8',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #E21833 0%, #FFD200 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderColor: '#E21833',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#E21833',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block',
                }}
              >
                {key}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2c2c2c', lineHeight: 1.6, wordBreak: 'break-word' }}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderClearingHouseData = (clearingHouseData: ClearingHouseRecord) => {
    // Only show these specific fields from the AWS headers reference
    const allowedFields = [
      'Enrollment End Date',
      'College Name',
      'ClearingHouse',
      'Requester Return Field',
      'College State',
      'Enrollment Major 1',
      'Class Level',
      'Degree Title',
    ];

    // Show only allowed fields with non-null values
    const filteredEntries = allowedFields
      .map(key => [key, clearingHouseData.payload[key]] as [string, unknown])
      .filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (String(value).toUpperCase() === 'NULL') return false;
        return true;
      });

    return (
      <Box>
        {renderSourceFileField(clearingHouseData.source_file)}
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          {filteredEntries.map(([key, value]) => (
            <Box
              key={key}
              sx={{
                p: 3,
                background: 'white',
                borderRadius: 3,
                border: '1px solid #e8e8e8',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #E21833 0%, #FFD200 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderColor: '#E21833',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#E21833',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block',
                }}
              >
                {key}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2c2c2c', lineHeight: 1.6, wordBreak: 'break-word' }}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'qualtrics':
        return 'Qualtrics Survey Data';
      case 'linkedin':
        return 'LinkedIn Profile Data';
      case 'clearinghouse':
        return 'ClearingHouse Enrollment Data';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'qualtrics':
        return <PollIcon sx={{ fontSize: 32, color: 'white' }} />;
      case 'linkedin':
        return <LinkedInIcon sx={{ fontSize: 32, color: 'white' }} />;
      case 'clearinghouse':
        return <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'qualtrics':
        return 'linear-gradient(135deg, #E21833 0%, #C41230 100%)';
      case 'linkedin':
        return 'linear-gradient(135deg, #0077B5 0%, #005885 100%)';
      case 'clearinghouse':
        return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: getGradient(),
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
              width: 56,
              height: 56,
              borderRadius: 2.5,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {getIcon()}
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            position: 'relative',
            zIndex: 1,
            width: 40,
            height: 40,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          py: 4,
          px: 4,
          background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
        }}
      >
        {type === 'qualtrics' && renderQualtricsData(data as QualtricsResponse)}
        {type === 'linkedin' && renderLinkedInData(data as LinkedInPosition)}
        {type === 'clearinghouse' && renderClearingHouseData(data as ClearingHouseRecord)}
      </DialogContent>
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          background: 'white',
          borderTop: '1px solid #f0f0f0',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
            px: 5,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(226, 24, 51, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C41230 0%, #A01028 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(226, 24, 51, 0.35)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
