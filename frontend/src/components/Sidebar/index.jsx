import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Container,
  Sprout,
  UtensilsCrossed,
  Waves,
  Stethoscope,
  Receipt,
  Wheat,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
  Droplets
} from 'lucide-react';

/**
 * Reusable Sidebar component.
 */
export const Sidebar = ({
  isOpen = true,
  onClose,
  className = '',
  onLogout,
}) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Farm Setup', path: '/farm-setup', icon: Building2 },
    { label: 'Tanks', path: '/tanks', icon: Container },
    { label: 'Crop Management', path: '/crops', icon: Sprout },
    { label: 'Feed Management', path: '/feed', icon: UtensilsCrossed },
    { label: 'Water Quality', path: '/water-quality', icon: Waves },
    { label: 'Medicines', path: '/medicines', icon: Stethoscope },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Harvest', path: '/harvest', icon: Wheat },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-border
          flex flex-col transition-transform duration-300 ease-in-out shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/80 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">AquaTrack</span>
          </NavLink>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-background"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto aqua-scrollbar px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 select-none
                    ${isActive
                      ? 'bg-primary text-white shadow-xs font-semibold'
                      : 'text-text-secondary hover:bg-primary-light/50 hover:text-primary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}

            {/* Logout Item */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-danger hover:bg-danger-light/50 transition-all duration-200 select-none mt-2 w-full text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border/80 bg-background/50 text-[11px] text-text-secondary text-center shrink-0">
          AquaTrack Platform v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
