import { Routes, Route } from 'react-router-dom';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import FarmSetup from '../pages/FarmSetup';
import Tanks from '../pages/Tanks';
import CropManagement from '../pages/CropManagement';
import FeedManagement from '../pages/FeedManagement';
import WaterQuality from '../pages/WaterQuality';
import Medicines from '../pages/Medicines';
import Expenses from '../pages/Expenses';
import Harvest from '../pages/Harvest';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/farm-setup" element={<FarmSetup />} />
      <Route path="/tanks" element={<Tanks />} />
      <Route path="/crops" element={<CropManagement />} />
      <Route path="/feed" element={<FeedManagement />} />
      <Route path="/water-quality" element={<WaterQuality />} />
      <Route path="/medicines" element={<Medicines />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/harvest" element={<Harvest />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
