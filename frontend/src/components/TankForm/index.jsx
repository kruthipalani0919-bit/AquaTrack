import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, Maximize2, Layers, Waves, FileText } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { WATER_SOURCE_OPTIONS, TANK_STATUS_OPTIONS } from '../../constants/tankData';

// Zod Validation Schema
const tankSchema = z.object({
  name: z
    .string()
    .min(1, 'Tank Name is required')
    .trim(),
  area: z
    .coerce
    .number({ invalid_type_error: 'Area must be a number' })
    .positive('Area must be greater than 0'),
  depth: z
    .coerce
    .number({ invalid_type_error: 'Depth must be a number' })
    .positive('Depth must be greater than 0'),
  waterSource: z
    .string()
    .min(1, 'Please select a Water Source'),
  status: z
    .string()
    .default('Active'),
  remarks: z
    .string()
    .optional(),
});

/**
 * Reusable TankForm component for Add & Edit tank operations.
 */
export const TankForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tankSchema),
    defaultValues: {
      name: '',
      area: '',
      depth: '',
      waterSource: '',
      status: 'Active',
      remarks: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        area: initialData.area || '',
        depth: initialData.depth || '',
        waterSource: initialData.waterSource || '',
        status: initialData.status || 'Active',
        remarks: initialData.remarks || '',
      });
    } else {
      reset({
        name: '',
        area: '',
        depth: '',
        waterSource: '',
        status: 'Active',
        remarks: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Tank Name */}
      <Input
        label="Tank Name"
        type="text"
        placeholder="e.g. Pond P-1 (Vannamei Main)"
        required={true}
        icon={<Container className="w-4 h-4" />}
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Area & Depth Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Area (Acres)"
          type="number"
          step="0.1"
          min="0.1"
          placeholder="e.g. 2.5"
          required={true}
          icon={<Maximize2 className="w-4 h-4" />}
          error={errors.area?.message}
          {...register('area')}
        />

        <Input
          label="Depth (Meters)"
          type="number"
          step="0.1"
          min="0.1"
          placeholder="e.g. 1.8"
          required={true}
          icon={<Layers className="w-4 h-4" />}
          error={errors.depth?.message}
          {...register('depth')}
        />
      </div>

      {/* Water Source & Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Water Source"
          required={true}
          placeholder="Select water source"
          options={WATER_SOURCE_OPTIONS}
          error={errors.waterSource?.message}
          {...register('waterSource')}
        />

        <Select
          label="Tank Status"
          required={false}
          options={TANK_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      {/* Remarks */}
      <Textarea
        label="Remarks / Notes (Optional)"
        placeholder="Add details on PL stocking count, soil treatment, aerators, etc."
        rows={3}
        error={errors.remarks?.message}
        {...register('remarks')}
      />

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
          {isEditing ? 'Update Tank' : 'Save Tank'}
        </Button>
      </div>
    </form>
  );
};

export default TankForm;
