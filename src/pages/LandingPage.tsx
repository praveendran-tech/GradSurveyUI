import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  keyframes,
  Chip,
  Stack,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Header } from '../components/Header';
import smallerLogo from '/Smaller_logo-0ftU-IPl.png';

// Professional keyframe animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const gradientMove = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Header />

      {/* Professional Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(226, 24, 51, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 210, 0, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(226, 24, 51, 0.15) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Animated mesh gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(255, 210, 0, 0.08) 0%, rgba(226, 24, 51, 0.1) 50%, rgba(255, 210, 0, 0.08) 100%)',
            backgroundSize: '200% 200%',
            animation: `${gradientMove} 15s ease infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative floating circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 210, 0, 0.15) 0%, rgba(255, 210, 0, 0.05) 100%)',
            filter: 'blur(40px)',
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '8%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.2) 0%, rgba(226, 24, 51, 0.05) 100%)',
            filter: 'blur(50px)',
            animation: `${float} 8s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 210, 0, 0.18) 0%, rgba(255, 210, 0, 0.08) 100%)',
            filter: 'blur(35px)',
            animation: `${float} 7s ease-in-out infinite 1s`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ py: { xs: 8, md: 12 } }}>
            <Box
              sx={{
                maxWidth: '900px',
                animation: `${fadeInUp} 0.8s ease-out`,
              }}
            >
              {/* Main headline */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '5rem' },
                  fontWeight: 900,
                  mb: 3,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #E21833 50%, #c41230 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Track Graduate
                </Box>
                <br />
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #FFD200 0%, #ffd700 50%, #ffed4e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Outcomes Data
                </Box>
              </Typography>

              {/* Subheadline */}
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 5,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                Streamline your graduate survey data collection and analysis. Integrate multiple
                data sources, track student outcomes, and generate comprehensive reports—all in
                one powerful platform.
              </Typography>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  mb: 5,
                  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/manage')}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                    boxShadow: '0 10px 30px rgba(226, 24, 51, 0.4)',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 40px rgba(226, 24, 51, 0.5)',
                      background: 'linear-gradient(135deg, #C41230 0%, #A01028 100%)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Launch Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={() => navigate('/download')}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 2,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderWidth: 2,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Download Reports
                </Button>
              </Stack>

              {/* Trust indicators */}
              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                sx={{
                  animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Secure & Compliant
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Comprehensive Reports
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Multi-Source Integration
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>

        {/* Bottom wave divider */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: 100,
            background: '#FAFAFA',
            clipPath: 'ellipse(75% 100% at 50% 100%)',
          }}
        />
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <Box
          textAlign="center"
          mb={8}
          sx={{
            animation: `${scaleIn} 0.8s ease-out`,
          }}
        >
          <Chip
            label="Features"
            sx={{
              background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.1) 0%, rgba(255, 210, 0, 0.1) 100%)',
              color: 'primary.main',
              fontWeight: 700,
              mb: 2,
              border: '1px solid rgba(226, 24, 51, 0.2)',
            }}
          />
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2,
            }}
          >
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #E21833 0%, #FFD200 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Everything You Need
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Powerful tools designed specifically for graduate program administrators and researchers
          </Typography>
        </Box>

        {/* Feature cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {/* Feature 1 */}
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.03) 0%, white 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(226, 24, 51, 0.3)',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 35, color: 'white' }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={700} color="#1E293B">
                Multi-Source Data Integration
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Seamlessly aggregate data from Qualtrics surveys, LinkedIn profiles, and National
                Student Clearinghouse into unified student records.
              </Typography>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.03) 0%, white 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(226, 24, 51, 0.3)',
                }}
              >
                <PeopleIcon sx={{ fontSize: 35, color: 'white' }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={700} color="#1E293B">
                Intelligent Filtering & Search
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Advanced filtering by name, UID, major, school, and term. Instant search results
                with powerful query capabilities.
              </Typography>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, rgba(255, 210, 0, 0.08) 0%, white 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #FFD200 0%, #FFC107 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(255, 210, 0, 0.3)',
                }}
              >
                <DownloadIcon sx={{ fontSize: 35, color: '#000' }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={700} color="#1E293B">
                Flexible Report Generation
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Export comprehensive CSV reports with customizable filters. Generate insights by
                major, school, term, or any combination.
              </Typography>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, rgba(255, 210, 0, 0.08) 0%, white 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFD200 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(255, 193, 7, 0.3)',
                }}
              >
                <SecurityIcon sx={{ fontSize: 35, color: '#000' }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={700} color="#1E293B">
                Secure Data Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Enterprise-grade security with role-based access control. Your sensitive student
                data is protected at every level.
              </Typography>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.8s ease-out 1s both`,
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, rgba(226, 24, 51, 0.03) 0%, white 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #C41230 0%, #A01028 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(196, 18, 48, 0.3)',
                }}
              >
                <DashboardIcon sx={{ fontSize: 35, color: 'white' }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={700} color="#1E293B">
                Intuitive Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Beautiful, responsive interface designed for efficiency. Manage thousands of records
                with ease and precision.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          background: '#f5f5f5',
          py: 4,
          mt: 8,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: 3,
            }}
          >
            {/* Left side - Logo and Department */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src={smallerLogo}
                alt="University of Maryland"
                sx={{ height: 60 }}
              />
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    letterSpacing: '0.5px',
                    fontSize: '0.95rem',
                  }}
                >
                  DIVISION OF STUDENT AFFAIRS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#E21833',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '0.3px',
                  }}
                >
                  UNIVERSITY CAREER CENTER & THE PRESIDENT'S PROMISE
                </Typography>
              </Box>
            </Box>

            {/* Right side - Contact Info */}
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mb: 0.5 }}>
                University Career Center & The President's Promise
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                3100 Hornbake Library, South Wing
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                301.314.7225
              </Typography>
            </Box>
          </Box>

          {/* Developer Attribution */}
          <Box
            sx={{
              textAlign: 'center',
              pt: 3,
              mt: 3,
              borderTop: '1px solid #e8e8e8',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontStyle: 'italic',
                color: '#999',
                fontSize: '0.85rem',
              }}
            >
              Made with ❤️ by Pranav Raveendran
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
