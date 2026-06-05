import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Login } from './screens/Login';
import { ShopSetup } from './screens/onboarding/ShopSetup';
import { Distributor } from './screens/onboarding/Distributor';
import { DistSetup } from './screens/onboarding/DistSetup';
import { Payout } from './screens/onboarding/Payout';
import { Ready } from './screens/onboarding/Ready';
import { DistLinkRetailers } from './screens/onboarding/DistLinkRetailers';
import { Home } from './screens/Home';
import { DistHome } from './screens/DistHome';
import { DistRetailers } from './screens/DistRetailers';
import { BuyFromDist } from './screens/BuyFromDist';
import { Sell } from './screens/Sell';

import { Cart } from './screens/Cart';
import { Success } from './screens/Success';
import { Earnings } from './screens/Earnings';
import { Inventory } from './screens/Inventory';
import { AddInventory } from './screens/AddInventory';
import { Wallet } from './screens/Wallet';
import { WalletAdd } from './screens/WalletAdd';
import { WalletWithdraw } from './screens/WalletWithdraw';
import { Settings } from './screens/Settings';
import { Assistant } from './screens/Assistant';
import { Notifications } from './screens/Notifications';
import { Toast } from './components/ui/Toast';
import { GlobalPopup } from './components/ui/GlobalPopup';
import { CampaignPortal } from './screens/CampaignPortal';

function AppRoutes() {
  const location = useLocation();
  const isCampaignPortal = location.pathname === '/campaign-portal';

  if (isCampaignPortal) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
        <Routes>
          <Route path="/campaign-portal" element={<CampaignPortal />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="shell" id="shell">
      <canvas id="confetti-c"></canvas>
      <Toast />
      <GlobalPopup />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup/shop" element={<ShopSetup />} />
        <Route path="/setup/distributor" element={<DistSetup />} />
        <Route path="/setup/distributor-link" element={<Distributor />} />
        <Route path="/setup/retailer-link" element={<DistLinkRetailers />} />
        <Route path="/setup/payout" element={<Payout />} />
        <Route path="/setup/ready" element={<Ready />} />
        <Route path="/home" element={<Home />} />
        <Route path="/distributor-home" element={<DistHome />} />
        <Route path="/dist-retailers" element={<DistRetailers />} />
        <Route path="/buy-from-dist" element={<BuyFromDist />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
        <Route path="/invoice" element={<AddInventory />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/add-inventory" element={<AddInventory />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/add" element={<WalletAdd />} />
        <Route path="/wallet/withdraw" element={<WalletWithdraw />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/sales" element={<Earnings />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
