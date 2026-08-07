import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Calendar, IndianRupee, Package, Activity, Container } from 'lucide-react';

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
    .optional()
    .or(z.literal('')),
  dosage: z
    .string()
    .optional(),
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
 * Contains ONLY backend-supported fields: tankId, medicineName, purpose, quantity, cost, date, notes.
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
        quantity: initialData.quantity || '',
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
      purpose: data.purpose ? data.purpose.trim() : '',
      dosage: initialData?.dosage || 'As required',
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Container className="w-3.5 h-3.5 text-primary" /> Basic Information
        </h4>
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
            label="Application Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>
      </div>

      {/* SECTION 2: MEDICINE & PURPOSE */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-primary" /> Treatment Details
        </h4>
        <div className="flex flex-col gap-4">
          <Input
            label="Medicine / Chemical Name"
            type="text"
            placeholder="e.g. BKC 80% Sanitizer"
            required={true}
            icon={<Stethoscope className="w-4 h-4" />}
            error={errors.medicineName?.message}
            {...register('medicineName')}
          />

          <Input
            label="Purpose of Treatment (Optional)"
            type="text"
            placeholder="Optional (e.g. Water sanitization, bacterial control)"
            required={false}
            icon={<Activity className="w-4 h-4" />}
            error={errors.purpose?.message}
            {...register('purpose')}
          />
        </div>
      </div>

      {/* SECTION 3: QUANTITY & COST (GROUPED NUMERIC FIELDS) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> Quantity & Expenditure
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            step="0.1"
            placeholder="e.g. 5"
            required={true}
            icon={<Package className="w-4 h-4 text-primary" />}
            error={errors.quantity?.message}
            {...register('quantity')}
          />

          <Input
            label="Treatment Cost (₹)"
            type="number"
            placeholder="e.g. 1750"
            required={true}
            icon={<IndianRupee className="w-4 h-4 text-primary" />}
            error={errors.cost?.message}
            {...register('cost')}
          />
        </div>
      </div>

      {/* SECTION 4: APPLICATION NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Application Notes (Optional)"
          placeholder="Add details on dilution ratio, aerator broadcast instructions, post-treatment check..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* ACTIONS */}
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
