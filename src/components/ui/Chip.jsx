import React from 'react';

export const Chip = React.memo(({ children, variant = 'dim', className = '', ...props }) => {
  const variantClass = variant ? `chip-${variant}` : '';
  return (
    <div className={`chip ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
});

Chip.displayName = 'Chip';

export const TierBadge = React.memo(({ tier = 'bronze' }) => {
  const tierConfig = {
    bronze: { label: 'Bronze', emoji: '🥉' },
    silver: { label: 'Silver', emoji: '🥈' },
    gold: { label: 'Gold', emoji: '🥇' },
    diamond: { label: 'Diamond', emoji: '💎' },
  };
  const config = tierConfig[tier] || tierConfig.bronze;
  return (
    <div className={`tier tier-${tier}`}>
      {config.emoji} {config.label} Tier
    </div>
  );
});

TierBadge.displayName = 'TierBadge';
