import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, ShieldAlert, Package, Scale, Layers } from 'lucide-react';

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

  // Clean Site label formatting without district or null
  const siteOptions = sites.map((s) => {
    const siteName = s.siteName || 'Site';
    const locationSuffix = s.location ? ` (${s.location})` : '';
    return {
      value: s.id,
      label: `${siteName}${locationSuffix}`,
    };
  });

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
      siteId: sites.length === 1 ? sites[0].id : '',
      allocatedQuantity: '',
      unit: 'kg',
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('category');

  // Auto-set unit default based on category if unchanged
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
    try {
      if (onSubmit) {
        await onSubmit(data);
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
