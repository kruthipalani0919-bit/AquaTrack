import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Container, Calendar, Clock, IndianRupee, Sparkles } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import {
  MEDICINE_CATEGORY_OPTIONS,
  MEDICINE_UNIT_OPTIONS,
  MEDICINE_STATUS_OPTIONS
} from '../../constants/medicineData';
import { useCrops } from '../../context/CropContext';

// Zod Validation Schema
const medicineSchema = z.object({
  cropId: z
    .string()
    .min(1, 'Please select a Crop Batch'),
  medicineName: z
    .string()
    .min(1, 'Medicine Name is required'),
  category: z
    .string()
    .min(1, 'Please select a Category'),
  dosage: z
    .coerce
    .number({ invalid_type_error: 'Dosage must be a number' })
    .positive('Dosage must be greater than 0'),
  unit: z
    .string()
    .min(1, 'Please select a Dosage Unit'),
  applicationDate: z
    .string()
    .min(1, 'Application Date is required'),
  applicationTime: z
    .string()
    .min(1, 'Application Time is required'),
  cost: z
    .coerce
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative'),
  purpose: z
    .string()
    .min(1, 'Purpose of treatment is required'),
  status: z
    .string()
    .default('Completed'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable MedicineForm component with dynamic Crop dropdown from CropContext
 * and auto-filled Tank details.
 */
export const MedicineForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { crops } = useCrops();
  const isEditing = Boolean(initialData?.id);

  const cropSelectOptions = crops.map((crop) => ({
    value: crop.id,
    label: `${crop.cropName} (${crop.tankName})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      cropId: '',
      medicineName: '',
      category: '',
      dosage: '',
      unit: 'Litre',
      applicationDate: new Date().toISOString().split('T')[0],
      applicationTime: '07:00 AM',
      cost: '',
      purpose: '',
      status: 'Completed',
      notes: '',
    },
    mode: 'onTouched',
  });

  // Watch selected cropId to auto-fill Tank details
  const selectedCropId = useWatch({ control, name: 'cropId' });

  const autoFilledTank = React.useMemo(() => {
    if (!selectedCropId) return null;
    const matchedCrop = crops.find((c) => c.id === selectedCropId);
    return matchedCrop ? { tankId: matchedCrop.tankId, tankName: matchedCrop.tankName } : null;
  }, [selectedCropId, crops]);

  useEffect(() => {
    if (initialData) {
      reset({
        cropId: initialData.cropId || '',
        medicineName: initialData.medicineName || '',
        category: initialData.category || '',
        dosage: initialData.dosage || '',
        unit: initialData.unit || 'Litre',
        applicationDate: initialData.applicationDate || '',
        applicationTime: initialData.applicationTime || '07:00 AM',
        cost: initialData.cost || '',
        purpose: initialData.purpose || '',
        status: initialData.status || 'Completed',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const matchedCrop = crops.find((c) => c.id === data.cropId);
    const payload = {
      ...data,
      cropName: matchedCrop ? matchedCrop.cropName : 'Selected Crop',
      tankId: matchedCrop ? matchedCrop.tankId : 'tank-1',
      tankName: matchedCrop ? matchedCrop.tankName : 'Auto-Filled Pond',
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Crop Selection & Auto-Filled Tank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Active Crop Batch"
          required={true}
          placeholder="Choose crop..."
          options={cropSelectOptions}
          error={errors.cropId?.message}
          {...register('cropId')}
        />

        <div>
          <Input
            label="Tank / Pond (Auto-Filled)"
            type="text"
            value={autoFilledTank ? autoFilledTank.tankName : 'Select a crop to auto-fill tank'}
            disabled={true}
            icon={<Container className="w-4 h-4 text-primary" />}
            className="bg-background text-primary font-semibold"
          />
          {autoFilledTank && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Linked to {autoFilledTank.tankName}
            </span>
          )}
        </div>
      </div>

      {/* Medicine Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Medicine / Chemical Name"
          type="text"
          placeholder="e.g. BKC 80% Sanitizer"
          required={true}
          icon={<Stethoscope className="w-4 h-4" />}
          error={errors.medicineName?.message}
          {...register('medicineName')}
        />

        <Select
          label="Medicine Category"
          required={true}
          placeholder="Select category..."
          options={MEDICINE_CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      {/* Dosage Amount, Unit, & Treatment Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Dosage Amount"
          type="number"
          step="0.1"
          placeholder="e.g. 2.5"
          required={true}
          error={errors.dosage?.message}
          {...register('dosage')}
        />

        <Select
          label="Dosage Unit"
          required={true}
          options={MEDICINE_UNIT_OPTIONS}
          error={errors.unit?.message}
          {...register('unit')}
        />

        <Input
          label="Treatment Cost (₹)"
          type="number"
          placeholder="e.g. 1750"
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.cost?.message}
          {...register('cost')}
        />
      </div>

      {/* Application Date, Time & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Application Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.applicationDate?.message}
          {...register('applicationDate')}
        />

        <Input
          label="Application Time"
          type="text"
          placeholder="e.g. 07:00 AM"
          required={true}
          icon={<Clock className="w-4 h-4" />}
          error={errors.applicationTime?.message}
          {...register('applicationTime')}
        />

        <Select
          label="Treatment Status"
          required={false}
          options={MEDICINE_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      {/* Treatment Purpose */}
      <Input
        label="Purpose of Treatment"
        type="text"
        placeholder="e.g. Water sanitization & bacterial reduction prior to stocking"
        required={true}
        error={errors.purpose?.message}
        {...register('purpose')}
      />

      {/* Field Notes */}
      <Textarea
        label="Application Notes & Observations (Optional)"
        placeholder="Add details on dilution ratio, aerator broadcast instructions, post-treatment check..."
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
          {isEditing ? 'Update Treatment Record' : 'Save Treatment Record'}
        </Button>
      </div>
    </form>
  );
};

export default MedicineForm;
