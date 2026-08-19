import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, ShieldAlert, Package, Scale } from 'lucide-react';

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
}) => {
  const { sites = [], loading: sitesLoading } = useSites();
  const [formError, setFormError] = useState('');

  const siteOptions = sites.map((s) => ({
    value: s.id,
    label: `${s.siteName} (${s.location}, ${s.district})`,
  }));

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

      {/* Stock Category */}
      <Select
        label="Stock Category"
        required={true}
        options={CATEGORY_OPTIONS}
        error={errors.category?.message}
        disabled={isSubmitting}
        onChange={handleCategoryChange}
        value={selectedCategory}
      />

      {/* Site Selection */}
      <Select
        label="Site"
        required={true}
        placeholder={sitesLoading ? 'Loading sites...' : 'Choose target site...'}
        options={siteOptions}
        disabled={sites.length === 0 || isSubmitting}
        error={errors.siteId?.message}
        icon={<MapPin className="w-4 h-4" />}
        {...register('siteId')}
      />

      {/* Quantity & Unit Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Allocated Quantity"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 1000"
          required={true}
          icon={<Package className="w-4 h-4" />}
          error={errors.allocatedQuantity?.message}
          disabled={sites.length === 0 || isSubmitting}
          {...register('allocatedQuantity')}
        />

        <Select
          label="Unit"
          required={true}
          options={UNIT_OPTIONS}
          error={errors.unit?.message}
          disabled={sites.length === 0 || isSubmitting}
          icon={<Scale className="w-4 h-4" />}
          {...register('unit')}
        />
      </div>

      {/* Action Buttons */}
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
          disabled={sites.length === 0}
          className="font-semibold"
        >
          Allocate Stock
        </Button>
      </div>
    </form>
  );
};

export default AllocateStockForm;
