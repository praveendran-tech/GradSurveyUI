import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Collapse,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  keyframes,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Student, MasterData } from '../types';
import { DataSourceCard } from './DataSourceCard';
import { AddManuallyDialog } from './AddManuallyDialog';
import { EditMasterDialog } from './EditMasterDialog';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(226, 24, 51, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(226, 24, 51, 0.4);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface StudentCardProps {
  student: Student;
  onSelectSource: (studentId: string, source: 'qualtrics' | 'linkedin' | 'clearinghouse') => void;
  onAddManual: (studentId: string, data: Partial<MasterData>) => void;
  onEditMaster: (studentId: string, data: Partial<MasterData>) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onSelectSource,
  onAddManual,
  onEditMaster,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [addManualOpen, setAddManualOpen] = useState(false);
  const [editMasterOpen, setEditMasterOpen] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const hasData = student.qualtricsData || student.linkedInData || student.clearingHouseData;
  const hasMasterData = student.masterData !== undefined;

  return (
    <>
      <Card
        sx={{
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: hasMasterData ? '2px solid' : '1px solid',
          borderColor: hasMasterData ? 'success.main' : 'divider',
          background: hasMasterData
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(255, 255, 255, 1) 100%)'
            : 'white',
          '&:hover': {
            boxShadow: hasMasterData ? '0 12px 32px rgba(76, 175, 80, 0.15)' : 6,
            transform: 'translateY(-4px)',
          },
          '&::before': hasMasterData
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4CAF50, #66BB6A, #4CAF50)',
                backgroundSize: '200% 100%',
                animation: `${glow} 2s ease-in-out infinite`,
              }
            : {},
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: hasMasterData
                      ? 'linear-gradient(135deg, #4CAF50, #66BB6A)'
                      : 'linear-gradient(135deg, #9E9E9E, #BDBDBD)',
                    animation: hasMasterData ? `${glow} 2s ease-in-out infinite` : 'none',
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #2C2C2C 0%, #666666 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {student.name}
                </Typography>
                {hasMasterData && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    label="Master DB"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      color: 'white',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    }}
                  />
                )}
              </Box>
              <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                sx={{
                  '& > *': {
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                    },
                    '&:first-of-type::before': {
                      display: 'none',
                    },
                    pl: 1,
                  },
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  UID: <strong style={{ color: '#2C2C2C' }}>{student.uid}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {student.major}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {student.term}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}
                sx={{ opacity: 0.7 }}
              >
                {student.school}
              </Typography>

              {/* Data availability indicators */}
              <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                {student.qualtricsData && (
                  <Chip
                    label="Qualtrics"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                )}
                {student.linkedInData && (
                  <Chip
                    label="LinkedIn"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #0A66C2 0%, #0077B5 100%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                )}
                {student.clearingHouseData && (
                  <Chip
                    label="ClearingHouse"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                )}
              </Box>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              {hasMasterData && (
                <IconButton
                  color="primary"
                  onClick={() => setEditMasterOpen(true)}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(226, 24, 51, 0.05) 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.2) 0%, rgba(226, 24, 51, 0.1) 100%)',
                      transform: 'scale(1.1) rotate(15deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton
                onClick={handleExpandClick}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: expanded
                    ? 'linear-gradient(135deg, #E21833 0%, #C41230 100%)'
                    : 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(226, 24, 51, 0.05) 100%)',
                  color: expanded ? 'white' : 'primary.main',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                    color: 'white',
                    transform: expanded ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)',
                  },
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>

        <Collapse in={expanded} timeout={500}>
          <CardContent
            sx={{
              pt: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(248, 249, 250, 0.5) 100%)',
              animation: `${slideDown} 0.5s ease-out`,
            }}
          >
            {hasData ? (
              <>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                  gap={3}
                  sx={{ mb: 3 }}
                >
                  {student.qualtricsData && (
                    <Box sx={{ animation: `${slideDown} 0.6s ease-out` }}>
                      <DataSourceCard
                        type="qualtrics"
                        data={student.qualtricsData}
                        onSelect={() => onSelectSource(student.id, 'qualtrics')}
                        isSelected={student.masterData?.selectedSource === 'qualtrics'}
                      />
                    </Box>
                  )}
                  {student.linkedInData && (
                    <Box sx={{ animation: `${slideDown} 0.7s ease-out` }}>
                      <DataSourceCard
                        type="linkedin"
                        data={student.linkedInData}
                        onSelect={() => onSelectSource(student.id, 'linkedin')}
                        isSelected={student.masterData?.selectedSource === 'linkedin'}
                      />
                    </Box>
                  )}
                  {student.clearingHouseData && (
                    <Box sx={{ animation: `${slideDown} 0.8s ease-out` }}>
                      <DataSourceCard
                        type="clearinghouse"
                        data={student.clearingHouseData}
                        onSelect={() => onSelectSource(student.id, 'clearinghouse')}
                        isSelected={student.masterData?.selectedSource === 'clearinghouse'}
                      />
                    </Box>
                  )}
                </Box>
                <Box
                  display="flex"
                  justifyContent="center"
                  sx={{
                    mt: 3,
                    pt: 3,
                    borderTop: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setAddManualOpen(true)}
                    sx={{
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(226, 24, 51, 0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Add Manually
                  </Button>
                </Box>
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto',
                    mb: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(255, 210, 0, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  No data available from sources
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddManualOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(226, 24, 51, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add Manually
                </Button>
              </Box>
            )}
          </CardContent>
        </Collapse>
      </Card>

      <AddManuallyDialog
        open={addManualOpen}
        onClose={() => setAddManualOpen(false)}
        onSave={(data) => onAddManual(student.id, data)}
        studentId={student.id}
      />

      <EditMasterDialog
        open={editMasterOpen}
        onClose={() => setEditMasterOpen(false)}
        onSave={(data) => onEditMaster(student.id, data)}
        currentData={student.masterData}
      />
    </>
  );
};
