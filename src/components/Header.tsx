import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Button, Stack } from '@mui/material';
import smallerLogo from '/Smaller_logo-0ftU-IPl.png';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = (path: string) => location.pathname === path;

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
              onClick={() => window.open('https://careers.umd.edu/', '_blank')}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            {[
              { label: 'Home',         path: '/' },
              { label: 'Student Data', path: '/manage' },
              { label: 'Export',       path: '/download' },
              { label: 'Dashboard',    path: '/dashboard' },
              { label: 'Reports',      path: '/report' },
            ].map(({ label, path }) => (
              <Button
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  color: path === '/report' ? 'white' : active(path) ? '#E21833' : '#1E293B',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  borderBottom: active(path) && path !== '/report' ? '2px solid #E21833' : '2px solid transparent',
                  bgcolor: path === '/report' ? (active(path) ? '#C41230' : '#E21833') : 'transparent',
                  '&:hover': {
                    color: path === '/report' ? 'white' : '#E21833',
                    bgcolor: path === '/report' ? '#C41230' : 'rgba(226,24,51,0.05)',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
};
