import { createTheme } from '@mui/material/styles';

// University of Maryland color palette
export const theme = createTheme({
  palette: {
    primary: {
      main: '#E21833', // UMD Red
      dark: '#C41230',
      light: '#E85168',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD200', // UMD Gold/Yellow
      dark: '#E6BD00',
      light: '#FFE033',
      contrastText: '#000000',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C', // Dark gray
      secondary: '#666666',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.02em',
      color: '#2C2C2C',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
      color: '#2C2C2C',
    },
    h3: {
      fontWeight: 700,
      color: '#2C2C2C',
    },
    h4: {
      fontWeight: 700,
      color: '#2C2C2C',
    },
    h5: {
      fontWeight: 700,
      color: '#2C2C2C',
    },
    h6: {
      fontWeight: 600,
      color: '#2C2C2C',
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    body2: {
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': {
          fontFamily: 'inherit',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
