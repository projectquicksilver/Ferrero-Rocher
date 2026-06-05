import React from 'react';
import { BottomNav } from './BottomNav';

export const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {children}
      <BottomNav />
    </div>
  );
};
