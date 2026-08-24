import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, ShieldAlert, Package, Scale, Layers, Info } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { useSites } from '../../context/SiteContext';

const allocateStockSchema = z.object({
  category: z.enum(['FEED', 'MEDICINE'], {
    errorMap: () => ({ message: 'Please select a valid Stock Category' }),
  }),
  siteId: z.string().min(1, 'Please select a Site'),
  allocatedQuantity: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Allocated Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').trim(),
});

const CATEGORY_OPTIONS = [
  { value: 'FEED', label: 'Feed' },
  { value: 'MEDICINE', label: 'Medicine' },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'bags', label: 'Bags' },
  { value: 'packets', label: 'Packets' },
  { value: 'units', label: 'Units' },
];

export const AllocateStockForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableStockings = [],
  initialRecord = null,
}) => {
  const { sites = [], loading: sitesLoading } = useSites();
  const [formError, setFormError] = useState('');

  // Clean Site label formatting
  const siteOptions = sites.map((s) => {
    const siteName = s.siteName || 'Site';
    const locationSuffix = s.location ? ` (${s.location})` : '';
    return {
      value: s.id,
      label: `${siteName}${locationSuffix}`,
    };
  });

  const defaultCategory = initialRecord?.category?.toUpperCase() || 'FEED';
  const defaultUnit = initialRecord?.unit || (defaultCategory === 'MEDICINE' ? 'L' : 'kg');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocateStockSchema),
    defaultValues: {
      category: defaultCategory,
      siteId: sites.length === 1 ? sites[0].id : '',
      allocatedQuantity: '',
      unit: defaultUnit,
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('category');
  const selectedUnit = watch('unit');

  // Auto-set siteId when sites finish loading asynchronously
  useEffect(() => {
    if (sites.length === 1) {
      setValue('siteId', sites[0].id);
    }
  }, [sites, setValue]);

  // Calculate Available Unallocated Quantity for the selected category or specific record
  const maxAvailable = React.useMemo(() => {
    if (initialRecord) {
      return initialRecord.unallocatedQuantity ?? Math.max((parseFloat(initialRecord.totalQuantity) || 0) - (parseFloat(initialRecord.totalAllocated) || 0), 0);
    }
    const categoryItems = availableStockings.filter(s => s.category?.toUpperCase() === selectedCategory?.toUpperCase());
    return categoryItems.reduce((sum, item) => {
      const itemUnallocated = item.unallocatedQuantity ?? Math.max((parseFloat(item.totalQuantity) || 0) - (parseFloat(item.totalAllocated) || 0), 0);
      return sum + itemUnallocated;
    }, 0);
  }, [initialRecord, availableStockings, selectedCategory]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setValue('category', val);
    const match = availableStockings.find((s) => s.category?.toUpperCase() === val.toUpperCase());
    if (match?.unit) {
      setValue('unit', match.unit);
    } else if (val === 'MEDICINE') {
      setValue('unit', 'L');
    } else {
      setValue('unit', 'kg');
    }
  };

  const handleFormSubmit = async (data) => {
    setFormError('');
    const requestedQty = parseFloat(data.allocatedQuantity);

    if (requestedQty > maxAvailable) {
      setFormError(`Allocated quantity (${requestedQty} ${selectedUnit}) cannot exceed available stock (${maxAvailable} ${selectedUnit}).`);
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit({
          ...data,
          stockingId: initialRecord?.id
        });
      }
    } catch (err) {
      console.error('[AllocateStockForm] Error during allocation submit:', err);
      setFormError(err.message || 'Failed to allocate stock to site');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {formError && (
        <div className="p-3.5 rounded-xl bg-danger-light/30 border border-danger/30 flex items-center gap-2.5 text-danger text-xs font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* AVAILABLE UNALLOCATED STOCK BANNER */}
      <div className="p-3 rounded-xl bg-primary-light/40 border border-primary/20 flex items-center justify-between text-xs">
        <span className="font-semibold text-text-secondary flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" /> Available Unallocated Stock:
        </span>
        <span className="font-extrabold text-sm text-primary">
          {maxAvailable} {selectedUnit || defaultUnit}
        </span>
      </div>

      {/* ALLOCATION DETAILS SECTION */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" /> Allocation Details
        </h4>

        {/* Stock Category Select */}
        <Select
          label="Stock Category"
          required={true}
          placeholder="Select category..."
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={isSubmitting || Boolean(initialRecord)}
        />

        {/* Site Select */}
        <Select
          label="Select Site"
          required={true}
          placeholder="Choose site location..."
          options={siteOptions}
          disabled={sitesLoading || isSubmitting}
          error={errors.siteId?.message}
          icon={<MapPin className="w-4 h-4 text-primary" />}
          {...register('siteId')}
        />

        {/* Quantity and Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Allocated Quantity"
            type="number"
            step="0.1"
            max={maxAvailable}
            placeholder={`Max: ${maxAvailable}`}
            required={true}
            icon={<Package className="w-4 h-4 text-primary" />}
            error={errors.allocatedQuantity?.message}
            disabled={isSubmitting || maxAvailable <= 0}
            {...register('allocatedQuantity')}
          />

          <Select
            label="Unit"
            required={true}
            placeholder="Select unit..."
            options={UNIT_OPTIONS}
            error={errors.unit?.message}
            disabled={isSubmitting}
            icon={<Scale className="w-4 h-4 text-primary" />}
            {...register('unit')}
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="font-semibold"
          disabled={maxAvailable <= 0}
        >
          Allocate Stock
        </Button>
      </div>
    </form>
  );
};

export default AllocateStockForm;
