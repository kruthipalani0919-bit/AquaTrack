import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Waves, Container, Calendar, Clock, Thermometer, Activity, Layers, Sparkles } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema
const waterSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  testDate: z
    .string()
    .min(1, 'Test Date is required'),
  testTime: z
    .string()
    .min(1, 'Test Time is required'),
  ph: z
    .coerce
    .number({ invalid_type_error: 'pH must be a number' })
    .min(0, 'pH must be >= 0')
    .max(14, 'pH cannot exceed 14'),
  temperature: z
    .coerce
    .number({ invalid_type_error: 'Temperature must be a number' })
    .positive('Temperature must be > 0'),
  dissolvedOxygen: z
    .coerce
    .number({ invalid_type_error: 'DO must be a number' })
    .min(0, 'DO must be >= 0'),
  salinity: z
    .coerce
    .number({ invalid_type_error: 'Salinity must be a number' })
    .min(0, 'Salinity must be >= 0'),
  ammonia: z
    .coerce
    .number({ invalid_type_error: 'Ammonia must be a number' })
    .min(0, 'Ammonia must be >= 0'),
  nitrite: z
    .coerce
    .number({ invalid_type_error: 'Nitrite must be a number' })
    .min(0, 'Nitrite must be >= 0'),
  alkalinity: z
    .coerce
    .number({ invalid_type_error: 'Alkalinity must be a number' })
    .min(0, 'Alkalinity must be >= 0'),
  waterLevel: z
    .coerce
    .number({ invalid_type_error: 'Water Level must be a number' })
    .positive('Water Level must be > 0'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable WaterForm component for logging & editing water quality parameters.
 */
export const WaterForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks } = useTanks();
  const isEditing = Boolean(initialData?.id);

  const tankSelectOptions = tanks.map((tank) => ({
    value: tank.id,
    label: `${tank.name} (${tank.waterSource})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(waterSchema),
    defaultValues: {
      tankId: '',
      testDate: new Date().toISOString().split('T')[0],
      testTime: '06:30 AM',
      ph: '',
      temperature: '',
      dissolvedOxygen: '',
      salinity: '',
      ammonia: '',
      nitrite: '',
      alkalinity: '',
      waterLevel: '',
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        testDate: initialData.testDate || '',
        testTime: initialData.testTime || '06:30 AM',
        ph: initialData.ph || '',
        temperature: initialData.temperature || '',
        dissolvedOxygen: initialData.dissolvedOxygen || '',
        salinity: initialData.salinity || '',
        ammonia: initialData.ammonia || '',
        nitrite: initialData.nitrite || '',
        alkalinity: initialData.alkalinity || '',
        waterLevel: initialData.waterLevel || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const matchedTank = tanks.find((t) => t.id === data.tankId);
    const payload = {
      ...data,
      tankName: matchedTank ? matchedTank.name : 'Selected Pond',
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Tank Select & Date/Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <Select
            label="Select Pond / Tank"
            required={true}
            placeholder="Choose tank..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />
        </div>

        <Input
          label="Test Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.testDate?.message}
          {...register('testDate')}
        />

        <Input
          label="Test Time"
          type="text"
          placeholder="e.g. 06:30 AM"
          required={true}
          icon={<Clock className="w-4 h-4" />}
          error={errors.testTime?.message}
          {...register('testTime')}
        />
      </div>

      {/* Primary Parameters Row 1: pH, Temp, DO, Salinity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="pH Level (7.5 - 8.5)"
          type="number"
          step="0.1"
          placeholder="e.g. 7.8"
          required={true}
          icon={<Waves className="w-4 h-4" />}
          error={errors.ph?.message}
          {...register('ph')}
        />

        <Input
          label="Temperature (°C)"
          type="number"
          step="0.1"
          placeholder="e.g. 28.5"
          required={true}
          icon={<Thermometer className="w-4 h-4" />}
          error={errors.temperature?.message}
          {...register('temperature')}
        />

        <Input
          label="DO (mg/L)"
          type="number"
          step="0.1"
          placeholder="e.g. 6.2"
          required={true}
          icon={<Activity className="w-4 h-4" />}
          error={errors.dissolvedOxygen?.message}
          {...register('dissolvedOxygen')}
        />

        <Input
          label="Salinity (ppt)"
          type="number"
          step="0.1"
          placeholder="e.g. 15.0"
          required={true}
          icon={<Sparkles className="w-4 h-4" />}
          error={errors.salinity?.message}
          {...register('salinity')}
        />
      </div>

      {/* Secondary Parameters Row 2: Ammonia, Nitrite, Alkalinity, Water Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="Ammonia (ppm)"
          type="number"
          step="0.01"
          placeholder="e.g. 0.05"
          required={true}
          error={errors.ammonia?.message}
          {...register('ammonia')}
        />

        <Input
          label="Nitrite (ppm)"
          type="number"
          step="0.01"
          placeholder="e.g. 0.08"
          required={true}
          error={errors.nitrite?.message}
          {...register('nitrite')}
        />

        <Input
          label="Alkalinity (ppm)"
          type="number"
          placeholder="e.g. 120"
          required={true}
          error={errors.alkalinity?.message}
          {...register('alkalinity')}
        />

        <Input
          label="Water Level (m)"
          type="number"
          step="0.1"
          placeholder="e.g. 1.8"
          required={true}
          icon={<Layers className="w-4 h-4" />}
          error={errors.waterLevel?.message}
          {...register('waterLevel')}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Sampling Notes & Observations (Optional)"
        placeholder="Add details on Secchi disc clarity, water color bloom, aerator response, etc."
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Actions */}
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
          {isEditing ? 'Update Water Check' : 'Log Water Check'}
        </Button>
      </div>
    </form>
  );
};

export default WaterForm;
