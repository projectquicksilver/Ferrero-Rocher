import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SubDBProvider, useSubDB } from './SubDBContext';
import { SubDBLogin } from './SubDBLogin';
import { SubDBProfile } from './SubDBProfile';
import { SubDBDashboard } from './SubDBDashboard';
import { SubDBInvoice } from './SubDBInvoice';

// Auth guard: no user → login; user without name → profile
const Guard = ({ element, needsProfile = true }) => {
  const { subUser } = useSubDB();
  if (!subUser) return <Navigate to="/subdb_platform/login" replace />;
  if (needsProfile && !subUser.name) return <Navigate to="/subdb_platform/profile" replace />;
  return element;
};

// Inner router (has context access)
const SubDBInner = () => {
  const { subUser } = useSubDB();

  const defaultRedirect = subUser?.name
    ? '/subdb_platform/dashboard'
    : subUser
      ? '/subdb_platform/profile'
      : '/subdb_platform/login';

  return (
    <Routes>
      <Route path="login" element={
        subUser?.name
          ? <Navigate to="/subdb_platform/dashboard" replace />
          : <SubDBLogin />
      } />
      <Route path="profile" element={
        <Guard element={<SubDBProfile />} needsProfile={false} />
      } />
      <Route path="dashboard" element={<Guard element={<SubDBDashboard />} />} />
      <Route path="invoice/new" element={<Guard element={<SubDBInvoice />} />} />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
};

export const SubDBRouter = () => (
  <SubDBProvider>
    <SubDBInner />
  </SubDBProvider>
);
