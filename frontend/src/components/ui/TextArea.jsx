import React from 'react';
import TextField from '@mui/material/TextField';

/**
 * Reusable TextArea Component using MUI
 * Wraps MUI TextField with multiline enabled.
 */
const TextArea = ({ label, id, error, rows = 4, className = '', ...props }) => {
  return (
    <div className={className} style={{ marginBottom: '1.5rem', width: '100%' }}>
      <TextField
        id={id}
        label={label}
        multiline
        rows={rows}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error}
        {...props}
      />
    </div>
  );
};

export default TextArea;
