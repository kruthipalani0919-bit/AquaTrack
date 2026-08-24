import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ShieldAlert, Scale, Info, Edit3 } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';

const editStockSchema = z.object({
  category: z.enum(['FEED', 'MEDICINE', 'SEED'], {
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
  costPerKg: z
    .string()
    .optional(),
});

const CATEGORY_OPTIONS = [
  { value: 'FEED', label: 'Feed' },
  { value: 'MEDICINE', label: 'Medicine' },
  { value: 'SEED', label: 'Seed' },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'bags', label: 'Bags' },
  { value: 'packets', label: 'Packets' },
  { value: 'units', label: 'Units' },
];

/**
  * EditStockForm component styled consistently with AquaTrack modals:
  * - Visually highlighted Edit Stock Details section card
  * - Pre-filled fields: Category, Total Quantity, Unit
  * - Context banner showing allocated quantity constraint
  * - Action buttons: Cancel, Save Changes
  */
export const EditStockForm = ({
  initialRecord,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formError, setFormError] = useState('');

  const allocatedQty = parseFloat(initialRecord?.totalAllocated || 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editStockSchema),
    defaultValues: {
      category: initialRecord?.category?.toUpperCase() || 'FEED',
      totalQuantity: initialRecord?.totalQuantity ?? '',
      unit: initialRecord?.unit || 'kg',
      costPerKg: initialRecord?.costPerKg ? String(initialRecord.costPerKg) : '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialRecord) {
      setValue('category', initialRecord.category?.toUpperCase() || 'FEED');
      setValue('totalQuantity', initialRecord.totalQuantity ?? '');
      setValue('unit', initialRecord.unit || 'kg');
      if (initialRecord.costPerKg) {
        setValue('costPerKg', String(initialRecord.costPerKg));
      }
    }
  }, [initialRecord, setValue]);

  const selectedCategory = watch('category');

  const handleFormSubmit = async (data) => {
    setFormError('');
    const newQty = parseFloat(data.totalQuantity);

    if (newQty < allocatedQty) {
      setFormError(
        `Total quantity (${newQty} ${data.unit}) cannot be less than already allocated quantity (${allocatedQty} ${initialRecord?.unit || data.unit}).`
      );
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update farm stock');
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

      {/* ALLOCATED QUANTITY CONSTRAINTS BANNER */}
      <div className="p-3 rounded-xl bg-primary-light/40 border border-primary/20 flex items-center justify-between text-xs">
        <span className="font-semibold text-text-secondary flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" /> Already Allocated Quantity:
        </span>
        <span className="font-extrabold text-sm text-primary">
          {allocatedQty} {initialRecord?.unit || 'kg'}
        </span>
      </div>

      {/* EDIT STOCK SECTION */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Edit3 className="w-3.5 h-3.5 text-primary" /> Edit Stock Details
        </h4>

        {/* Category */}
        <Select
          label="Category"
          required={true}
          placeholder="Select stock type..."
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          disabled={isSubmitting || allocatedQty > 0}
          value={selectedCategory}
          onChange={(e) => setValue('category', e.target.value)}
        />
        {allocatedQty > 0 && (
          <p className="text-[11px] text-text-secondary -mt-2">
            Category cannot be modified because stock has already been allocated to sites.
          </p>
        )}

        {/* Quantity & Unit Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Quantity"
            type="number"
            step="0.01"
            min={allocatedQty || 0.01}
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

        {selectedCategory === 'SEED' && (
          <Input
            label="Cost Per Kg (₹)"
            type="number"
            step="0.01"
            placeholder="Enter cost per kg..."
            required={true}
            error={errors.costPerKg?.message}
            disabled={isSubmitting}
            {...register('costPerKg')}
          />
        )}
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditStockForm;
