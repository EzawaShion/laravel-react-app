import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Reusable Button Component using MUI
 * 
 * Maps 'variant' prop from our custom system to MUI variants:
 * - primary -> variant="contained" color="primary"
 * - secondary -> variant="outlined" color="inherit" or "primary"
 * - ghost -> variant="text"
 * - danger -> variant="contained" color="error"
 */
const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  isLoading = false,
  className = '',
  disabled,
  leftIcon,
  onClick,
  ...props
}) => {

  let muiVariant = 'contained';
  let muiColor = 'primary';

  if (variant === 'secondary') {
    muiVariant = 'outlined';
    muiColor = 'primary'; // or inherit
  } else if (variant === 'ghost') {
    muiVariant = 'text';
  } else if (variant === 'danger') {
    muiVariant = 'contained';
    muiColor = 'error';
  }

  return (
    <MuiButton
      type={type}
      variant={muiVariant}
      color={muiColor}
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
      startIcon={!isLoading ? leftIcon : null}
      style={{
        padding: '10px 24px',
        fontWeight: 600,
        textTransform: 'none', // Keep text case as is
        // Add gradient for primary if desired to match previous look? 
        // For now stick to standard MUI theme.
      }}
      {...props}
    >
      {isLoading && <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />}
      {children}
    </MuiButton>
  );
};

export default Button;
