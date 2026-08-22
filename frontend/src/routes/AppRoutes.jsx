import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import FarmSetup from '../pages/FarmSetup';
import Sites from '../pages/Sites';
import Tanks from '../pages/Tanks';
import CropManagement from '../pages/CropManagement';
import Stocking from '../pages/Stocking';
import FeedManagement from '../pages/FeedManagement';
import Medicines from '../pages/Medicines';
import Expenses from '../pages/Expenses';
import PondLeaseManagement from '../pages/PondLeaseManagement';
import Harvest from '../pages/Harvest';
import Reports from '../pages/Reports';
import NotFound from '../pages/NotFound';

import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Unprotected Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 2. Protected Routes with DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farm-setup" element={<FarmSetup />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/tanks" element={<Tanks />} />
          <Route path="/crops" element={<CropManagement />} />
          <Route path="/stocking" element={<Stocking />} />
          <Route path="/feed" element={<FeedManagement />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/pond-lease" element={<PondLeaseManagement />} />
          <Route path="/harvest" element={<Harvest />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* 3. Reusable 404 Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
