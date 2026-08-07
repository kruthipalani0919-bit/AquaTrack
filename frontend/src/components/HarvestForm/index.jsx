import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wheat, Calendar, Weight, IndianRupee, User, Truck, Container } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/harvests)
// Rule: Do NOT include revenue or profit fields
const harvestSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  harvestDate: z
    .string()
    .min(1, 'Harvest Date is required'),
  production: z
    .coerce
    .number({ invalid_type_error: 'Production must be a number' })
    .positive('Production must be greater than 0'),
  averageWeight: z
    .coerce
    .number({ invalid_type_error: 'Average Weight must be a number' })
    .positive('Average Weight must be greater than 0')
    .optional()
    .or(z.literal('')),
  survivalRate: z
    .coerce
    .number()
    .optional(),
  sellingPrice: z
    .coerce
    .number({ invalid_type_error: 'Selling Price must be a number' })
    .positive('Selling Price must be greater than 0'),
  buyerName: z
    .string()
    .min(1, 'Buyer Name is required')
    .trim(),
  transportationCost: z
    .coerce
    .number({ invalid_type_error: 'Transportation Cost must be a number' })
    .min(0, 'Transportation Cost cannot be negative'),
  harvestExpense: z
    .coerce
    .number({ invalid_type_error: 'Harvest Expense must be a number' })
    .min(0, 'Harvest Expense cannot be negative'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable HarvestForm component with dynamic Tank dropdown from TankContext.
 * Contains ONLY backend-supported fields: tankId, harvestDate, production, averageWeight,
 * survivalRate, sellingPrice, buyerName, transportationCost, harvestExpense, notes.
 * Rule: Does NOT include or calculate revenue or profit.
 */
export const HarvestForm = ({
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
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      tankId: '',
      harvestDate: new Date().toISOString().split('T')[0],
      production: '',
      averageWeight: '',
      survivalRate: '85',
      sellingPrice: '',
      buyerName: '',
      transportationCost: '0',
      harvestExpense: '0',
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        harvestDate: initialData.harvestDate || '',
        production: initialData.production || '',
        averageWeight: initialData.averageWeight || '',
        survivalRate: initialData.survivalRate || '85',
        sellingPrice: initialData.sellingPrice || '',
        buyerName: initialData.buyerName || '',
        transportationCost: initialData.transportationCost || '0',
        harvestExpense: initialData.harvestExpense || '0',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    const parsedAbw = data.averageWeight ? parseFloat(data.averageWeight) : 18.5;
    const parsedSr = data.survivalRate ? parseFloat(data.survivalRate) : 85;

    // Backend Request Model: { tankId, harvestDate, production, averageWeight, survivalRate, sellingPrice, buyerName, transportationCost, harvestExpense, notes }
    const harvestPayload = {
      tankId: data.tankId,
      harvestDate: data.harvestDate,
      production: parseFloat(data.production),
      averageWeight: (!isNaN(parsedAbw) && parsedAbw > 0) ? parsedAbw : 18.5,
      survivalRate: (!isNaN(parsedSr) && parsedSr >= 0) ? parsedSr : 85,
      sellingPrice: parseFloat(data.sellingPrice),
      buyerName: data.buyerName.trim(),
      transportationCost: parseFloat(data.transportationCost || 0),
      harvestExpense: parseFloat(data.harvestExpense || 0),
      notes: data.notes ? data.notes.trim() : '',
    };

    console.log('Backend Harvest Payload:', harvestPayload);

    if (onSubmit) {
      onSubmit({
        ...harvestPayload,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Tank',
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

        {/* Row 1: Pond / Tank & Harvest Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Pond / Tank"
            required={true}
            placeholder="Choose pond..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />

          <Input
            label="Harvest Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.harvestDate?.message}
            {...register('harvestDate')}
          />
        </div>

        {/* Buyer / Trader Name */}
        <Input
          label="Buyer / Trader Name"
          type="text"
          placeholder="e.g. Coastal Seafood Traders"
          required={true}
          icon={<User className="w-4 h-4" />}
          error={errors.buyerName?.message}
          {...register('buyerName')}
        />

        {/* Selling Price (₹ / Kg) */}
        <Input
          label="Selling Price (₹/kg)"
          type="number"
          step="1"
          placeholder="e.g. 420"
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.sellingPrice?.message}
          {...register('sellingPrice')}
        />
      </div>

      {/* SECTION 2: HARVEST DETAILS */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Wheat className="w-3.5 h-3.5" /> Harvest Details
        </h4>

        {/* Production (Kg) */}
        <Input
          label="Production (kg)"
          type="number"
          step="0.1"
          placeholder="e.g. 3500"
          required={true}
          icon={<Wheat className="w-4 h-4 text-primary" />}
          error={errors.production?.message}
          {...register('production')}
        />

        {/* Average Body Weight (Optional) */}
        <Input
          label="Average Weight (ABW in grams)"
          type="number"
          step="0.1"
          placeholder="Optional (e.g. 18.5)"
          required={false}
          icon={<Weight className="w-4 h-4 text-primary" />}
          error={errors.averageWeight?.message}
          {...register('averageWeight')}
        />

        {/* Transportation Cost & Harvest Expense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Transportation Cost (₹)"
            type="number"
            step="1"
            placeholder="e.g. 1500"
            required={true}
            icon={<Truck className="w-4 h-4 text-primary" />}
            error={errors.transportationCost?.message}
            {...register('transportationCost')}
          />

          <Input
            label="Harvest Expense (₹)"
            type="number"
            step="1"
            placeholder="e.g. 3000"
            required={true}
            icon={<IndianRupee className="w-4 h-4 text-primary" />}
            error={errors.harvestExpense?.message}
            {...register('harvestExpense')}
          />
        </div>
      </div>

      {/* SECTION 3: NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add buyer details, harvest quality, transportation remarks or any additional notes..."
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
          {isEditing ? 'Update Harvest Record' : 'Register Harvest'}
        </Button>
      </div>
    </form>
  );
};

export default HarvestForm;
