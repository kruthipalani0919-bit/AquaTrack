import React from 'react';
import { Menu, Droplets } from 'lucide-react';

/**
 * Reusable Navbar component.
 */
export const Navbar = ({
  onMenuClick,
  className = '',
  actionsSlot,
}) => {
  return (
    <header className={`sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 transition-all ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button */}
        <div className="flex items-center gap-3 w-1/4">
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
        </div>

        {/* Center: Main AQUA TRACK Branding with Logo */}
        <div className="flex-1 flex items-center justify-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-center">
            <span className="font-bold text-lg sm:text-xl text-primary tracking-tight leading-tight uppercase">
              AquaTrack
            </span>
            <span className="text-[10px] text-text-secondary font-semibold tracking-widest uppercase">
              FARM PLATFORM
            </span>
          </div>
        </div>

        {/* Right Side: Optional Actions Slot */}
        <div className="flex items-center justify-end gap-2.5 w-1/4 select-none">
          {actionsSlot}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
