import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, Maximize2, Layers } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { WATER_SOURCE_OPTIONS } from '../../constants/tankData';

// Zod Validation Schema matching backend contract (POST /api/tanks)
const tankSchema = z.object({
  tankName: z
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
  remarks: z
    .string()
    .optional(),
});

/**
 * Reusable TankForm component for Add & Edit tank operations.
 * Contains ONLY backend-supported fields: tankName, area, depth, waterSource, remarks.
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
      tankName: '',
      area: '',
      depth: '',
      waterSource: '',
      remarks: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankName: initialData.tankName || initialData.name || '',
        area: initialData.area || '',
        depth: initialData.depth || '',
        waterSource: initialData.waterSource || '',
        remarks: initialData.remarks || '',
      });
    } else {
      reset({
        tankName: '',
        area: '',
        depth: '',
        waterSource: '',
        remarks: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    // Backend Tank Request Model: { tankName, area, depth, waterSource, remarks }
    const tankPayload = {
      tankName: data.tankName.trim(),
      area: parseFloat(data.area),
      depth: parseFloat(data.depth),
      waterSource: data.waterSource,
      remarks: data.remarks ? data.remarks.trim() : '',
    };

    console.log('Tank Payload:', tankPayload);

    if (onSubmit) {
      onSubmit({
        ...tankPayload,
        name: tankPayload.tankName,
      });
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
        error={errors.tankName?.message}
        {...register('tankName')}
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

      {/* Water Source */}
      <Select
        label="Water Source"
        required={true}
        placeholder="Select water source"
        options={WATER_SOURCE_OPTIONS}
        error={errors.waterSource?.message}
        {...register('waterSource')}
      />

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
