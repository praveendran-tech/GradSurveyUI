import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Button, Stack } from '@mui/material';
import smallerLogo from '/Smaller_logo-0ftU-IPl.png';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* UMD Red Top Bar */}
      <Box
        sx={{
          background: '#E21833',
          color: 'white',
          py: 0.75,
          fontSize: '0.875rem',
          fontWeight: 500,
          textAlign: 'center',
          letterSpacing: '0.5px',
        }}
      >
        UNIVERSITY OF MARYLAND | Graduate Outcomes Data Management System
      </Box>

      {/* UMD White Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={smallerLogo}
              alt="University of Maryland"
              style={{ height: '50px', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => navigate('/')}
              sx={{
                color: '#1E293B',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  color: '#E21833',
                  background: 'rgba(226, 24, 51, 0.05)',
                },
              }}
            >
              Home
            </Button>
            <Button
              onClick={() => navigate('/manage')}
              sx={{
                color: '#1E293B',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  color: '#E21833',
                  background: 'rgba(226, 24, 51, 0.05)',
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate('/download')}
              sx={{
                color: '#1E293B',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  color: '#E21833',
                  background: 'rgba(226, 24, 51, 0.05)',
                },
              }}
            >
              Reports
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
};
