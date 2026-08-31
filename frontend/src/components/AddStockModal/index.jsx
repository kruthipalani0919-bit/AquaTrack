import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ShieldAlert, Scale, MapPin } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { useSites } from '../../context/SiteContext';

const addStockSchema = z.object({
  siteId: z
    .string()
    .min(1, 'Please select a Site')
    .trim(),
  category: z.enum(['FEED', 'MEDICINE'], {
    errorMap: () => ({ message: 'Please select a valid Stock Category' }),
  }),
  totalQuantity: z
    .coerce
    .number({ invalid_type_error: 'Total Quantity must be a number' })
    .positive('Total Quantity must be greater than 0'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .trim(),
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
 * Reusable AddStockForm component styled consistently with AquaTrack registration modals:
 * - Direct Site selection for site-level stock addition
 * - Category *, Total Quantity *, Unit * fields with icons & clear placeholders
 * - Bottom right action buttons: Cancel, Add Stock
 */
export const AddStockForm = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const { sites = [] } = useSites();
  const [formError, setFormError] = useState('');

  const siteOptions = sites.map((site) => ({
    value: site.id,
    label: `${site.siteName} (${site.location || 'Location'})`,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      siteId: sites.length > 0 ? sites[0].id : '',
      category: 'FEED',
      totalQuantity: '',
      unit: 'kg',
    },
    mode: 'onTouched',
  });

  const selectedCategory = watch('category');

  // Auto-set unit default based on category if unchanged
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setValue('category', val);
    if (val === 'MEDICINE') {
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
      setFormError(err.message || 'Failed to add stock');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {formError && (
        <div className="p-3 rounded-xl bg-danger-light/30 border border-danger/30 flex items-center gap-2.5 text-danger text-xs font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* STOCK INFORMATION SECTION */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Package className="w-3.5 h-3.5 text-primary" /> Site Stock Information
        </h4>

        {/* Site Selector */}
        <Select
          label="Site"
          required={true}
          placeholder="Select site..."
          options={siteOptions}
          error={errors.siteId?.message}
          disabled={isSubmitting}
          icon={<MapPin className="w-4 h-4 text-primary" />}
          {...register('siteId')}
        />

        {/* Category */}
        <Select
          label="Category"
          required={true}
          placeholder="Select stock type..."
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          disabled={isSubmitting}
          onChange={handleCategoryChange}
          value={selectedCategory}
        />

        {/* Quantity & Unit Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Quantity"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter quantity..."
            required={true}
            icon={<Package className="w-4 h-4 text-primary" />}
            error={errors.totalQuantity?.message}
            disabled={isSubmitting}
            {...register('totalQuantity')}
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
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isSubmitting ? 'Adding...' : 'Add Stock'}
        </Button>
      </div>
    </form>
  );
};

export default AddStockForm;
