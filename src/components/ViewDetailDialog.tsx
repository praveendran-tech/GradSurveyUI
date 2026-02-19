import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PollIcon from '@mui/icons-material/Poll';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import type { QualtricsData, LinkedInData, ClearingHouseData } from '../types';

interface ViewDetailDialogProps {
  open: boolean;
  onClose: () => void;
  data: QualtricsData | LinkedInData | ClearingHouseData | null;
  type: 'qualtrics' | 'linkedin' | 'clearinghouse';
}

export const ViewDetailDialog: React.FC<ViewDetailDialogProps> = ({
  open,
  onClose,
  data,
  type,
}) => {
  if (!data) return null;

  const renderQualtricsData = (qualtricsData: QualtricsData) => (
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
          {qualtricsData.surveyId}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
        Survey Responses
      </Typography>
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {Object.entries(qualtricsData.responses).map(([key, value], index) => (
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

  const renderLinkedInData = (linkedInData: LinkedInData) => (
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
          Professional Experience
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {linkedInData.positions.map((position, index) => (
          <Box
            key={index}
            sx={{
              p: 3.5,
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#E21833', mb: 1 }}>
              {position.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 2, fontWeight: 600 }}>
              {position.company}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 0.75,
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid rgba(226, 24, 51, 0.1)',
                mb: position.description ? 2 : 0,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                {position.startDate} - {position.endDate || 'Present'}
              </Typography>
            </Box>
            {position.description && (
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7, mt: 2 }}>
                {position.description}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          mt: 5,
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
          Education
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {linkedInData.education.map((edu, index) => (
          <Box
            key={index}
            sx={{
              p: 3.5,
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#E21833', mb: 1 }}>
              {edu.school}
            </Typography>
            <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 2, fontWeight: 600 }}>
              {edu.degree} • {edu.field}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 0.75,
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
                borderRadius: 2,
                border: '1px solid rgba(226, 24, 51, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                {edu.startDate} - {edu.endDate}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderClearingHouseData = (clearingHouseData: ClearingHouseData) => (
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
          Enrollment Records
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {clearingHouseData.enrollmentRecords.map((record, index) => (
          <Box
            key={index}
            sx={{
              p: 3.5,
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#E21833', mb: 1 }}>
              {record.institution}
            </Typography>
            <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 2.5, fontWeight: 600 }}>
              {record.degree} • {record.major}
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 2,
                  py: 0.75,
                  background: record.status.toLowerCase().includes('enrolled')
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(129, 199, 132, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: record.status.toLowerCase().includes('enrolled')
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(226, 24, 51, 0.1)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: record.status.toLowerCase().includes('enrolled') ? '#4CAF50' : '#E21833',
                  }}
                >
                  {record.status}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 2,
                  py: 0.75,
                  background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)',
                  borderRadius: 2,
                  border: '1px solid rgba(226, 24, 51, 0.1)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                  Enrolled: {record.enrollmentDate}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

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
        {type === 'qualtrics' && renderQualtricsData(data as QualtricsData)}
        {type === 'linkedin' && renderLinkedInData(data as LinkedInData)}
        {type === 'clearinghouse' && renderClearingHouseData(data as ClearingHouseData)}
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
