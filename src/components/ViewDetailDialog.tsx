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
import WorkIcon from '@mui/icons-material/Work';
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

  const renderQualtricsData = (qualtricsData: QualtricsResponse) => {
    // Fields to ignore in Qualtrics data
    const ignoredFields = [
      'Duration (in seconds)',
      'Q_DataPolicyViolations',
      'ExternalReference',
      'LocationLongitude',
      'LocationLatitude',
      'ResponseId',
      'IPAddress',
      'ContactID',
      'DistributionChannel'
    ];

    // Filter out null, undefined, empty values, booleans, and ignored fields from payload
    const filteredEntries = Object.entries(qualtricsData.payload).filter(([key, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (typeof value === 'boolean') return false;
      // Filter out string representations of booleans (case variations)
      const stringValue = String(value);
      if (stringValue === 'true' || stringValue === 'false' ||
          stringValue === 'True' || stringValue === 'False' ||
          stringValue === 'TRUE' || stringValue === 'FALSE') return false;
      if (ignoredFields.includes(key)) return false;
      // Filter out status fields with IP addresses
      if (key.toLowerCase() === 'status' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(stringValue)) return false;
      return true;
    });

    return (
      <Box>
        <Box
          sx={{
            mb: 4,
            p: 2,
            background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(226, 24, 51, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Survey ID:
          </Typography>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {qualtricsData.survey_id || 'N/A'}
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
          Survey Responses
        </Typography>
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
    // Filter out null, undefined, empty values, and booleans from payload
    const filteredEntries = Object.entries(linkedInData.payload).filter(([_, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (typeof value === 'boolean') return false;
      return true;
    });

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #f0f0f0',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(226, 24, 51, 0.2)',
            }}
          >
            <WorkIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            LinkedIn Profile Data
          </Typography>
        </Box>
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
    // Filter out null, undefined, empty values, and booleans from payload
    const filteredEntries = Object.entries(clearingHouseData.payload).filter(([_, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (typeof value === 'boolean') return false;
      return true;
    });

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #f0f0f0',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(226, 24, 51, 0.2)',
            }}
          >
            <SchoolIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            ClearingHouse Enrollment Data
          </Typography>
        </Box>
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
