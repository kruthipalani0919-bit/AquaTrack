import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { FEED_TYPE_OPTIONS } from '../../constants/feedData';
import { useCrops } from '../../context/CropContext';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable FeedFilters component for search, date, crop, tank, and feed type filters.
 */
export const FeedFilters = ({
  searchQuery = '',
  onSearchChange,
  typeFilter = '',
  onTypeChange,
  cropFilter = '',
  onCropChange,
  tankFilter = '',
  onTankChange,
  dateFilter = '',
  onDateChange,
  onReset,
  className = '',
}) => {
  const { crops = [] } = useCrops();
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(
    searchQuery || typeFilter || cropFilter || tankFilter || dateFilter
  );

  const typeOptions = [
    { value: '', label: 'All Feed Types' },
    ...FEED_TYPE_OPTIONS,
  ];

  const cropOptions = [
    { value: '', label: 'All Crops' },
    ...(crops || []).map((c) => ({ value: c.id, label: c.cropName || 'Crop' })),
  ];

  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => ({ value: t.id, label: t.name || t.tankName || 'Tank' })),
  ];

  return (
    <div className={`flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Top Search Bar */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search feed brand, notes, crop or tank name..."
        />
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-1">
        {/* Feed Type */}
        <Select
          placeholder=""
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          fullWidth
        />

        {/* Crop Select */}
        <Select
          placeholder=""
          options={cropOptions}
          value={cropFilter}
          onChange={(e) => onCropChange(e.target.value)}
          fullWidth
        />

        {/* Tank Select */}
        <Select
          placeholder=""
          options={tankOptions}
          value={tankFilter}
          onChange={(e) => onTankChange(e.target.value)}
          fullWidth
        />

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="Select Date"
            className="text-xs"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={<X className="w-4 h-4 text-danger" />}
              className="text-xs text-danger font-medium hover:bg-danger-light/50 shrink-0"
              title="Reset Filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;
