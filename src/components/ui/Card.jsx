import React from 'react';

export const Card = React.memo(({ children, variant = 'default', className = '', ...props }) => {
  const variantClass = variant === 'default' ? 'card' : `card-${variant}`;
  return (
    <div className={`${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';
