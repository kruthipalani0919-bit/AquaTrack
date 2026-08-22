import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable Search Bar component.
 */
export const SearchBar = forwardRef(({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search tanks, crops, feeds...',
  fullWidth = true,
  className = '',
  id = 'search-bar-input',
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-center ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="absolute left-3 text-text-secondary pointer-events-none shrink-0">
        <Search className="w-4 h-4" />
      </div>

      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border border-border
          pl-9 pr-9 py-2 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          hover:border-text-secondary/40
        "
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
