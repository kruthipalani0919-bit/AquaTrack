import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { MEDICINE_CATEGORY_OPTIONS, MEDICINE_STATUS_OPTIONS } from '../../constants/medicineData';
import { useCrops } from '../../context/CropContext';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable MedicineFilters component for search, category, crop, tank, status, and date filters.
 */
export const MedicineFilters = ({
  searchQuery = '',
  onSearchChange,
  categoryFilter = '',
  onCategoryChange,
  cropFilter = '',
  onCropChange,
  tankFilter = '',
  onTankChange,
  statusFilter = '',
  onStatusChange,
  dateFilter = '',
  onDateChange,
  onReset,
  className = '',
}) => {
  const { crops = [] } = useCrops();
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(
    searchQuery || categoryFilter || cropFilter || tankFilter || statusFilter || dateFilter
  );

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...MEDICINE_CATEGORY_OPTIONS,
  ];

  const cropOptions = [
    { value: '', label: 'All Crops' },
    ...(crops || []).map((c) => ({ value: c.id, label: c.cropName || 'Crop' })),
  ];

  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => ({ value: t.id, label: t.name || t.tankName || 'Tank' })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...MEDICINE_STATUS_OPTIONS,
  ];

  return (
    <div className={`flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search medicine name, purpose, crop or tank name..."
        />
      </div>

      {/* Multi-Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end pt-1">
        {/* Category */}
        <Select
          placeholder=""
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          fullWidth
        />

        {/* Crop */}
        <Select
          placeholder=""
          options={cropOptions}
          value={cropFilter}
          onChange={(e) => onCropChange(e.target.value)}
          fullWidth
        />

        {/* Tank */}
        <Select
          placeholder=""
          options={tankOptions}
          value={tankFilter}
          onChange={(e) => onTankChange(e.target.value)}
          fullWidth
        />

        {/* Status */}
        <Select
          placeholder=""
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          fullWidth
        />

        {/* Date Filter & Reset */}
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

export default MedicineFilters;
