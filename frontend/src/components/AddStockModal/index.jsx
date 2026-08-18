import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ShieldAlert, Scale } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';

const addStockSchema = z.object({
  category: z.enum(['FEED', 'MEDICINE'], {
    errorMap: () => ({ message: 'Please select a valid Category (Feed or Medicine)' }),
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

export const AddStockForm = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
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
      setFormError(err.message || 'Failed to add farm stock');
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

      {/* Category */}
      <Select
        label="Category"
        required={true}
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
          placeholder="e.g. 5000"
          required={true}
          icon={<Package className="w-4 h-4" />}
          error={errors.totalQuantity?.message}
          disabled={isSubmitting}
          {...register('totalQuantity')}
        />

        <Select
          label="Unit"
          required={true}
          options={UNIT_OPTIONS}
          error={errors.unit?.message}
          disabled={isSubmitting}
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
          className="font-semibold"
        >
          Add Stock
        </Button>
      </div>
    </form>
  );
};

export default AddStockForm;
