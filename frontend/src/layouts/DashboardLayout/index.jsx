import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';

import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { SearchBar } from '../../components/SearchBar';
import { Breadcrumb } from '../../components/Breadcrumb';
import { Loader } from '../../components/Loader';
import { authService } from '../../services/authService';

/**
 * Reusable DashboardLayout component for AquaTrack application.
 * Requirements met:
 * - Desktop fixed sidebar with collapse/expand, mobile drawer sidebar.
 * - Top Navbar fixed at top.
 * - Automatic Breadcrumb header (Dashboard > Current Page).
 * - Brief page transition loading using Loader.
 * - Scrollable Outlet main content.
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle page transition loader (Requirement 10)
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Generate dynamic breadcrumb items (Requirement 11)
  const getBreadcrumbItems = (pathname) => {
    const routeTitles = {
      '/dashboard': 'Dashboard Overview',
      '/farm-setup': 'Farm Setup',
      '/tanks': 'Tanks',
      '/crops': 'Crop Management',
      '/feed': 'Feed Management',
      '/water-quality': 'Water Quality',
      '/medicines': 'Medicines',
      '/expenses': 'Expenses',
      '/harvest': 'Harvest',
      '/reports': 'Reports',
      '/settings': 'Settings',
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

  const currentUser = authService.getCurrentUser();

  return (
    <div className="h-screen w-full bg-background text-text-primary flex overflow-hidden">
      {/* Page Navigation Loader */}
      {isNavigating && <Loader fullPage={true} text="Loading page..." />}

      {/* 1. SIDEBAR (Fixed on desktop with collapse/expand, drawer on mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onLogout={() => navigate('/login')}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* 2. TOP NAVBAR */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
          searchSlot={
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search tanks, crops, water logs..."
            />
          }
          actionsSlot={
            <div className="hidden sm:flex items-center gap-2 bg-primary-light/60 px-3 py-1.5 rounded-lg border border-primary/20">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-primary truncate max-w-[140px]">
                {currentUser.farm || 'Farm'}
              </span>
            </div>
          }
        />

        {/* 3. SCROLLABLE CONTENT WITH AUTOMATIC BREADCRUMB HEADER */}
        <main className="flex-1 overflow-y-auto aqua-scrollbar p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Automatic Breadcrumb (Requirement 11) */}
          <div className="pb-2 border-b border-border/40">
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
