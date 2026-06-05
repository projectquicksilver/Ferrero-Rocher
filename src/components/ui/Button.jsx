import React from 'react';

export const Button = React.memo(({ children, variant = 'primary', className = '', ...props }) => {
  const baseClass = 'btn';
  const variantClass = variant ? `btn-${variant}` : '';
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export const IconButton = React.memo(({ children, className = '', isBack = false, ...props }) => {
  return (
    <button className={`${isBack ? 'btn-back' : 'btn-icon'} ${className}`} {...props}>
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
