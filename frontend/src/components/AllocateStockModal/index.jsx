import React, { useState, useMemo, useEffect } from 'react';
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

/**
 * Reusable AllocateStockForm component styled consistently with AquaTrack registration modals:
 * - Visually highlighted Allocation Details section card
 * - Stock Category *, Select Site *, Allocated Quantity *, Unit * fields with icons
 * - Available unallocated stock helper card & validation against over-allocation
 * - Bottom right action buttons: Cancel, Allocate Stock
 */
export const AllocateStockForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableStockings = [],
}) => {
  const { sites = [], loading: sitesLoading } = useSites();
  const [formError, setFormError] = useState('');

  // Active non-deleted site options
  const siteOptions = useMemo(() => {
    return (sites || [])
      .filter((s) => s && s.id)
      .map((s) => {
        const siteName = s.siteName || 'Site';
        const locationSuffix = s.location ? ` (${s.location})` : '';
        return {
          value: String(s.id),
          label: `${siteName}${locationSuffix}`,
        };
      });
  }, [sites]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocateStockSchema),
    defaultValues: {
      category: 'FEED',
      siteId: siteOptions.length > 0 ? siteOptions[0].value : '',
      allocatedQuantity: '',
      unit: 'kg',
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('category');

  // Find matching farm stock for selected category
  const categoryStock = useMemo(() => {
    const catUpper = (selectedCategory || 'FEED').toUpperCase();
    return availableStockings.find((s) => s && s.category?.toUpperCase() === catUpper);
  }, [availableStockings, selectedCategory]);

  // Compute available unallocated quantity
  const availableUnallocated = useMemo(() => {
    if (!categoryStock) return 0;
    if (categoryStock.unallocatedQuantity !== undefined && categoryStock.unallocatedQuantity !== null) {
      return parseFloat(categoryStock.unallocatedQuantity) || 0;
    }
    const total = parseFloat(categoryStock.totalQuantity) || 0;
    const allocated = parseFloat(categoryStock.totalAllocated) || 0;
    return Math.max(total - allocated, 0);
  }, [categoryStock]);

  // Auto-set unit default based on category if unchanged
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setValue('category', val);
    const match = availableStockings.find((s) => s && s.category?.toUpperCase() === val.toUpperCase());
    if (match?.unit) {
      setValue('unit', match.unit);
    } else if (val === 'MEDICINE') {
      setValue('unit', 'L');
    } else {
      setValue('unit', 'kg');
    }
  };

  useEffect(() => {
    if (categoryStock?.unit) {
      setValue('unit', categoryStock.unit);
    }
  }, [categoryStock, setValue]);

  const handleFormSubmit = async (data) => {
    setFormError('');

    if (siteOptions.length === 0) {
      setFormError('No active site available for allocation. Please create a site first.');
      return;
    }

    if (!categoryStock) {
      setFormError(`No farm stock found for category "${data.category}". Please add stock first.`);
      return;
    }

    const requestedQty = parseFloat(data.allocatedQuantity);
    if (requestedQty > availableUnallocated) {
      setFormError(
        `Allocated quantity (${requestedQty} ${data.unit}) cannot exceed available unallocated stock (${availableUnallocated} ${data.unit}).`
      );
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit({
          ...data,
          stockingId: categoryStock.id,
        });
      }
    } catch (err) {
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

      {/* Helper Info Card: Available Unallocated Stock */}
      <div className="p-3 rounded-xl bg-background border border-border/60 flex items-center justify-between text-xs shadow-2xs">
        <span className="text-text-secondary font-medium flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary" /> Unallocated {selectedCategory} Stock
        </span>
        <span className="font-bold text-primary">
          {categoryStock
            ? `${availableUnallocated} ${categoryStock.unit || (selectedCategory === 'MEDICINE' ? 'L' : 'kg')}`
            : '0 In Stock'}
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
          disabled={isSubmitting}
        />

        {/* Site Select */}
        <Select
          label="Select Site"
          required={true}
          placeholder="Choose site location..."
          options={siteOptions}
          disabled={sitesLoading || isSubmitting || siteOptions.length === 0}
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
            placeholder="e.g. 100"
            required={true}
            icon={<Package className="w-4 h-4 text-primary" />}
            error={errors.allocatedQuantity?.message}
            disabled={isSubmitting}
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
        >
          Allocate Stock
        </Button>
      </div>
    </form>
  );
};

export default AllocateStockForm;
