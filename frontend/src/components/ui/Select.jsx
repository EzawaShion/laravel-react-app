import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

/**
 * Reusable Select Component using MUI
 * 
 * Note: MUI Select via TextField expects 'children' to be MenuItem components,
 * but our CreatePost passes standard <option> tags.
 * We need to adapt or instruct React to ensure children are handled correctly via MenuItem?
 * Or we can just render children. MUI Select *can* accept native options if 'SelectProps={{ native: true }}' is set.
 * Let's try native select first for easiest migration from <option>, 
 * OR we recommend changing usage to pass items array.
 * 
 * Given we want "UI folder only" changes if possible, using `native: true` allows standard <option> children to work.
 * However, native select loses some Material Design beauty (dropdown menu).
 * 
 * Better approach: Map children. But children are React elements.
 * If we use `TextField select`, passing `<option>` as children renders native select look inside mui wrapper? No, it expects `MenuItem`.
 * 
 * Let's use `SelectProps={{ native: true }}` to support existing `<option>` tags in `CreatePost.jsx`.
 * This keeps the caller code compatible while using MUI's label and box styling.
 * 
 */
const Select = ({ label, id, error, children, className = '', ...props }) => {
  return (
    <div className={className} style={{ marginBottom: '1.5rem', width: '100%' }}>
      <TextField
        id={id}
        select
        label={label}
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error}
        SelectProps={{
          native: true,
        }}
        InputLabelProps={{
          shrink: true, // Needed for native select to handle label correctly with empty values sometimes
        }}
        {...props}
      >
        {children}
      </TextField>
    </div>
  );
};

export default Select;
