import React from 'react';
import TextField from '@mui/material/TextField';

/**
 * Reusable Input Component using MUI
 */
const Input = ({ label, id, type = 'text', error, className = '', ...props }) => {
  return (
    <div className={className} style={{ marginBottom: '1.5rem', width: '100%' }}>
      <TextField
        id={id}
        label={label}
        type={type}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error}
        {...props}
      />
    </div>
  );
};

export default Input;
