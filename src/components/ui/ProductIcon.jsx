import React from 'react';

// List of valid Material Symbols icon names (common ones used in the app)
const VALID_ICONS = [
  'inventory_2', 'shield', 'local_pharmacy', 'fastfood', 'medical_services',
  'health_and_safety', 'emergency', 'checkroom', 'shopping_cart', 'bolt',
  'card_giftcard', 'person', 'search', 'add', 'close', 'menu', 'check_circle',
  'error_circle', 'warning', 'info', 'help', 'settings', 'edit', 'delete',
  'download', 'upload', 'refresh', 'logout', 'login', 'home', 'store',
  'shopping_bag', 'wallet', 'credit_card', 'money', 'trending_up', 'trending_down',
  'analytics', 'bar_chart', 'pie_chart', 'calendar', 'clock', 'notifications',
  'call', 'mail', 'language', 'translate', 'favorite', 'star', 'thumb_up',
  'thumb_down', 'share', 'link', 'copy', 'print', 'visibility', 'visibility_off',
  'lock', 'unlock', 'check', 'clear', 'expand', 'collapse', 'arrow_forward',
  'arrow_back', 'arrow_up', 'arrow_down', 'arrow_right', 'arrow_left'
];

// Function to get product initials
const getProductInitials = (productName) => {
  if (!productName) return '?';
  const words = productName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return productName.substring(0, 2).toUpperCase();
};

// Function to check if icon name is valid
const isValidIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return false;
  return VALID_ICONS.includes(iconName.trim().toLowerCase());
};

// Function to generate a color based on product name
const getInitialColor = (productName) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const ProductIcon = ({ product, size = '2.4rem', fontSize = '1.2rem' }) => {
  // Check if icon is valid
  const hasValidIcon = isValidIcon(product?.icon);

  if (hasValidIcon) {
    // Display material symbol icon
    return (
      <span 
        className="material-symbols-outlined" 
        style={{ 
          fontSize: fontSize, 
          color: product?.clr || 'var(--o4)',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {product.icon.trim().toLowerCase()}
      </span>
    );
  } else {
    // Display product initials
    const initials = getProductInitials(product?.name || 'P');
    const bgColor = getInitialColor(product?.name || 'Product');
    
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: '#fff',
          fontWeight: 800,
          fontSize: 'calc(' + fontSize + ' * 0.75)',
          userSelect: 'none'
        }}
      >
        {initials}
      </div>
    );
  }
};
