import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

export type AlertSeverity = 'success' | 'error' | 'warning' | 'confirm';

interface AlertDialogProps {
  open: boolean;
  severity: AlertSeverity;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;   // only used when severity === 'confirm'
}

const CONFIG = {
  success: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />,
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    confirmLabel: 'OK',
  },
  error: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 36 }} />,
    color: '#E21833',
    gradient: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
    confirmLabel: 'OK',
  },
  warning: {
    icon: <WarningAmberIcon sx={{ fontSize: 36 }} />,
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    confirmLabel: 'OK',
  },
  confirm: {
    icon: <WarningAmberIcon sx={{ fontSize: 36 }} />,
    color: '#E21833',
    gradient: 'linear-gradient(135deg, #E21833 0%, #C41230 100%)',
    confirmLabel: 'Delete',
  },
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  severity,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  const cfg = CONFIG[severity];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: cfg.gradient,
          color: 'white',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          {cfg.icon}
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': { background: 'rgba(255,255,255,0.2)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, justifyContent: 'flex-end' }}>
        {severity === 'confirm' && (
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderWidth: 2,
              borderColor: '#e8e8e8',
              color: '#666',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { borderWidth: 2, borderColor: '#999' },
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={severity === 'confirm' ? onConfirm : onClose}
          sx={{
            background: cfg.gradient,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { opacity: 0.9, boxShadow: 'none' },
          }}
        >
          {cfg.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
