import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Calendar, IndianRupee, Package, Activity } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/medicines)
const medicineSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  medicineName: z
    .string()
    .min(1, 'Medicine Name is required')
    .trim(),
  purpose: z
    .string()
    .min(1, 'Purpose of treatment is required')
    .trim(),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .trim(),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  cost: z
    .coerce
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative'),
  date: z
    .string()
    .min(1, 'Application Date is required'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable MedicineForm component with dynamic Tank dropdown from TankContext.
 * Contains ONLY backend-supported fields: tankId, medicineName, purpose, dosage, quantity, cost, date, notes.
 */
export const MedicineForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks } = useTanks();
  const isEditing = Boolean(initialData?.id);

  const tankSelectOptions = tanks.map((tank) => ({
    value: tank.id,
    label: `${tank.name} (${tank.area} Acres - ${tank.waterSource})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      tankId: '',
      medicineName: '',
      purpose: '',
      dosage: '',
      quantity: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        medicineName: initialData.medicineName || '',
        purpose: initialData.purpose || '',
        dosage: initialData.dosage ? String(initialData.dosage) : '',
        quantity: initialData.quantity || initialData.dosage || '',
        cost: initialData.cost || '',
        date: initialData.date || initialData.applicationDate || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Backend Request Model: { tankId, medicineName, purpose, dosage, quantity, cost, date, notes }
    const medicinePayload = {
      tankId: data.tankId,
      medicineName: data.medicineName.trim(),
      purpose: data.purpose.trim(),
      dosage: data.dosage.trim(),
      quantity: parseFloat(data.quantity),
      cost: parseFloat(data.cost),
      date: data.date,
      notes: data.notes ? data.notes.trim() : '',
    };

    console.log('Backend Medicine Payload:', medicinePayload);

    if (onSubmit) {
      onSubmit({
        ...medicinePayload,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Pond',
        applicationDate: medicinePayload.date,
        status: initialData?.status || 'Completed',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Tank Select & Medicine Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Pond / Tank"
          required={true}
          placeholder="Choose pond..."
          options={tankSelectOptions}
          error={errors.tankId?.message}
          {...register('tankId')}
        />

        <Input
          label="Medicine / Chemical Name"
          type="text"
          placeholder="e.g. BKC 80% Sanitizer"
          required={true}
          icon={<Stethoscope className="w-4 h-4" />}
          error={errors.medicineName?.message}
          {...register('medicineName')}
        />
      </div>

      {/* Purpose & Dosage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Purpose of Treatment"
          type="text"
          placeholder="e.g. Water sanitization & bacterial control"
          required={true}
          icon={<Activity className="w-4 h-4" />}
          error={errors.purpose?.message}
          {...register('purpose')}
        />

        <Input
          label="Dosage"
          type="text"
          placeholder="e.g. 2.5 Litre/Acre"
          required={true}
          error={errors.dosage?.message}
          {...register('dosage')}
        />
      </div>

      {/* Quantity, Cost & Application Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Quantity"
          type="number"
          step="0.1"
          placeholder="e.g. 5"
          required={true}
          icon={<Package className="w-4 h-4" />}
          error={errors.quantity?.message}
          {...register('quantity')}
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

        <Input
          label="Application Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* Application Notes */}
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
