import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import type { MasterData } from '../types';

interface EditMasterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<MasterData>) => void;
  currentData: MasterData | undefined;
}

export const EditMasterDialog: React.FC<EditMasterDialogProps> = ({
  open,
  onClose,
  onSave,
  currentData,
}) => {
  const [formData, setFormData] = useState({
    currentActivity: '',
    employmentStatus: '',
    currentEmployer: '',
    currentPosition: '',
    enrollmentStatus: '',
    currentInstitution: '',
  });

  useEffect(() => {
    if (currentData) {
      setFormData({
        currentActivity: currentData.currentActivity || '',
        employmentStatus: currentData.employmentStatus || '',
        currentEmployer: currentData.currentEmployer || '',
        currentPosition: currentData.currentPosition || '',
        enrollmentStatus: currentData.enrollmentStatus || '',
        currentInstitution: currentData.currentInstitution || '',
      });
    }
  }, [currentData]);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSave = () => {
    const masterData: Partial<MasterData> = {
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    onSave(masterData);
    onClose();
  };

  const getSourceBadge = () => {
    if (!currentData) return null;
    const sourceColors: Record<string, string> = {
      qualtrics: '#E21833',
      linkedin: '#0077B5',
      clearinghouse: '#4CAF50',
      manual: '#FF9800',
    };
    const sourceLabels: Record<string, string> = {
      qualtrics: 'Qualtrics',
      linkedin: 'LinkedIn',
      clearinghouse: 'ClearingHouse',
      manual: 'Manual Entry',
    };
    return (
      <Chip
        label={`Source: ${sourceLabels[currentData.selectedSource || ''] || 'Unknown'}`}
        size="small"
        sx={{
          background: `linear-gradient(135deg, ${sourceColors[currentData.selectedSource || '']} 0%, ${sourceColors[currentData.selectedSource || '']}CC 100%)`,
          color: 'white',
          fontWeight: 600,
        }}
      />
    );
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
          background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
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
            <EditIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>
              Edit Master Entry
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.875rem' }}>
              Update student information in master database
            </Typography>
          </Box>
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
        {getSourceBadge() && (
          <Box sx={{ mb: 4 }}>
            {getSourceBadge()}
          </Box>
        )}
        <Stack spacing={4} sx={{ mt: 0.5 }}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2.5,
                pb: 1.5,
                borderBottom: '2px solid #f0f0f0',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Primary Activity
              </Typography>
            </Box>
            <TextField
              fullWidth
              select
              label="What is the student currently doing?"
              value={formData.currentActivity}
              onChange={handleChange('currentActivity')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'white',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e8e8e8',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                  },
                },
              }}
            >
              <MenuItem value="continuing-education">🎓 Continuing Education</MenuItem>
              <MenuItem value="working">💼 Working/Employed</MenuItem>
              <MenuItem value="military">🎖️ Military Service</MenuItem>
              <MenuItem value="entrepreneur">🚀 Started Own Business</MenuItem>
              <MenuItem value="seeking">🔍 Seeking Employment</MenuItem>
              <MenuItem value="other">📋 Other</MenuItem>
            </TextField>
          </Box>

          {/* Show Employment Fields for: working, entrepreneur */}
          {(formData.currentActivity === 'working' || formData.currentActivity === 'entrepreneur') && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: '2px solid #f0f0f0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {formData.currentActivity === 'entrepreneur' ? 'Business Information' : 'Employment Information'}
                </Typography>
              </Box>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  select
                  label="Employment Status"
                  value={formData.employmentStatus}
                  onChange={handleChange('employmentStatus')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e8e8e8',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                      },
                    },
                  }}
                >
                  <MenuItem value="employed">✅ Employed</MenuItem>
                  <MenuItem value="self-employed">🚀 Self-Employed</MenuItem>
                  <MenuItem value="part-time">⏰ Part-Time</MenuItem>
                  <MenuItem value="contract">📄 Contract/Freelance</MenuItem>
                </TextField>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  }}
                >
                  <TextField
                    fullWidth
                    label={formData.currentActivity === 'entrepreneur' ? 'Business Name' : 'Current Employer'}
                    placeholder={formData.currentActivity === 'entrepreneur' ? 'e.g. TechStartup Inc...' : 'e.g. Google, Microsoft...'}
                    value={formData.currentEmployer}
                    onChange={handleChange('currentEmployer')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4CAF50',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label={formData.currentActivity === 'entrepreneur' ? 'Your Role' : 'Current Position'}
                    placeholder={formData.currentActivity === 'entrepreneur' ? 'e.g. Founder, CEO...' : 'e.g. Software Engineer...'}
                    value={formData.currentPosition}
                    onChange={handleChange('currentPosition')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4CAF50',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          )}

          {/* Show Education Fields for: continuing-education */}
          {formData.currentActivity === 'continuing-education' && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: '2px solid #f0f0f0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Education Information
                </Typography>
              </Box>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  select
                  label="Enrollment Status"
                  value={formData.enrollmentStatus}
                  onChange={handleChange('enrollmentStatus')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e8e8e8',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                      },
                    },
                  }}
                >
                  <MenuItem value="enrolled">📚 Currently Enrolled</MenuItem>
                  <MenuItem value="full-time">📖 Full-Time Student</MenuItem>
                  <MenuItem value="part-time">⏰ Part-Time Student</MenuItem>
                  <MenuItem value="graduated">🎓 Recently Graduated</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Current Institution"
                  placeholder="e.g. University of Maryland..."
                  value={formData.currentInstitution}
                  onChange={handleChange('currentInstitution')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e8e8e8',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Show Military Fields for: military */}
          {formData.currentActivity === 'military' && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: '2px solid #f0f0f0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Military Service Information
                </Typography>
              </Box>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Branch of Service"
                  placeholder="e.g. Army, Navy, Air Force, Marines, Coast Guard..."
                  value={formData.currentEmployer}
                  onChange={handleChange('currentEmployer')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e8e8e8',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Rank/Position"
                  placeholder="e.g. Sergeant, Lieutenant..."
                  value={formData.currentPosition}
                  onChange={handleChange('currentPosition')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e8e8e8',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Show minimal fields for: seeking, other */}
          {(formData.currentActivity === 'seeking' || formData.currentActivity === 'other') && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: '2px solid #f0f0f0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Additional Information
                </Typography>
              </Box>
              <TextField
                fullWidth
                select
                label="Current Status"
                value={formData.employmentStatus}
                onChange={handleChange('employmentStatus')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e8e8e8',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4CAF50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4CAF50',
                      borderWidth: 2,
                    },
                  },
                }}
              >
                <MenuItem value="actively-seeking">🔍 Actively Seeking</MenuItem>
                <MenuItem value="not-seeking">⏸️ Not Seeking Employment</MenuItem>
                <MenuItem value="transitioning">🔄 In Transition</MenuItem>
                <MenuItem value="other">📋 Other</MenuItem>
              </TextField>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          background: 'white',
          borderTop: '1px solid #f0f0f0',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            borderWidth: 2,
            borderColor: '#e8e8e8',
            color: '#666',
            '&:hover': {
              borderWidth: 2,
              borderColor: '#4CAF50',
              color: '#4CAF50',
              background: 'rgba(76, 175, 80, 0.03)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
            px: 5,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
