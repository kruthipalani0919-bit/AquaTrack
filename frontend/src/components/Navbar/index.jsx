import React from 'react';
import { Bell, Menu, User, Droplets } from 'lucide-react';

/**
 * Reusable Navbar component.
 */
export const Navbar = ({
  user = { name: 'Farm Manager', role: 'Owner' },
  onMenuClick,
  notificationCount = 3,
  className = '',
  searchSlot,
  actionsSlot,
}) => {
  return (
    <header className={`sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 transition-all ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-base text-primary tracking-tight leading-tight">
                AquaTrack
              </span>
              <span className="text-[10px] text-text-secondary font-medium tracking-wider uppercase">
                Farm Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center: Optional Search Slot */}
        {searchSlot && (
          <div className="hidden md:block flex-1 max-w-md mx-4">
            {searchSlot}
          </div>
        )}

        {/* Right Side: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {actionsSlot}

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
            )}
          </button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* User Avatar & Info */}
          <div className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-background transition-colors select-none">
            <div className="w-8 h-8 rounded-full bg-secondary-light text-primary font-semibold text-xs flex items-center justify-center border border-secondary/30">
              {user.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-primary leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-text-secondary">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
