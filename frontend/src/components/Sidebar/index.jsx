import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';

import { SIDEBAR_MENU_ITEMS } from '../../constants/sidebarMenu';
import { authService } from '../../services/authService';

/**
 * Reusable Sidebar component with NavLink active states, mobile drawer behavior,
 * and desktop collapse/expand functionality.
 */
export const Sidebar = ({
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await authService.logout();
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
          fixed lg:static top-0 left-0 z-40 h-screen bg-surface border-r border-border
          flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/80 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <span className={`font-bold text-lg text-primary tracking-tight transition-opacity ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              AquaTrack
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse/Expand Toggle */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-background transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            )}

            {/* Mobile Close Button */}
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
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto aqua-scrollbar px-3 py-4">
          <nav className="flex flex-col gap-1">
            {SIDEBAR_MENU_ITEMS.map((item) => {
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
                    ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            {/* Logout Item */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-danger hover:bg-danger-light/50 transition-all duration-200 select-none mt-2 w-full text-left
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                Logout
              </span>
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className={`p-4 border-t border-border/80 bg-background/50 text-[11px] text-text-secondary text-center shrink-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
          AquaTrack Platform v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
