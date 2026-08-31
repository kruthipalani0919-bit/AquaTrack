import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { SearchBar } from '../../components/SearchBar';
import { Breadcrumb } from '../../components/Breadcrumb';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import farmService from '../../services/farmService';

/**
 * Reusable DashboardLayout component for AquaTrack application.
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, farm, farmName } = useAuth();

  // Handle page transition loader
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Generate dynamic breadcrumb items
  const getBreadcrumbItems = (pathname) => {
    const routeTitles = {
      '/dashboard': 'Dashboard Overview',
      '/farm-setup': 'Farm Setup',
      '/tanks': 'Tanks',
      '/crops': 'Crop Management',
      '/feed': 'Feed Management',
      '/medicines': 'Medicines',
      '/expenses': 'Expenses',
      '/harvest': 'Harvest',
      '/reports': 'Reports',
    };

    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard', path: '/dashboard' }];
    }

    const currentTitle = routeTitles[pathname] || 'Current Page';
    return [
      { label: 'Dashboard', path: '/dashboard' },
      { label: currentTitle },
    ];
  };

  const currentUser = {
    name: user?.fullName || user?.name || 'Farmer',
    role: 'Farm Owner',
    farm: farmName || farm?.farmName || user?.farmName || 'Farm',
  };

  return (
    <div className="h-screen w-full bg-background text-text-primary flex overflow-hidden print:h-auto print:w-full print:overflow-visible print:bg-white">
      {/* Page Navigation Loader */}
      {isNavigating && <Loader fullPage={true} text="Loading page..." />}

      {/* 1. SIDEBAR */}
      <div className="print:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onLogout={() => navigate('/login')}
          farmName={farmName || farm?.farmName || user?.farmName}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:w-full print:overflow-visible">
        {/* 2. TOP NAVBAR */}
        <div className="print:hidden">
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* 3. SCROLLABLE CONTENT WITH AUTOMATIC BREADCRUMB HEADER */}
        <main className="flex-1 overflow-y-auto aqua-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 print:h-auto print:max-h-none print:overflow-visible print:p-0 print:space-y-4">
          {/* Automatic Breadcrumb */}
          <div className="pb-2 border-b border-border/40 print:hidden">
            <Breadcrumb items={getBreadcrumbItems(location.pathname)} />
          </div>

          {/* Render Page Outlet */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
