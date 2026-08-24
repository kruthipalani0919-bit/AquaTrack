import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, IndianRupee, Container } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import {
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_MODE_OPTIONS
} from '../../constants/expenseData';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching frontend required fields
const expenseSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  category: z
    .string()
    .min(1, 'Please select an Expense Category'),
  amount: z
    .coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  paymentMode: z
    .string()
    .min(1, 'Please select a Payment Mode'),
  date: z
    .string()
    .min(1, 'Date is required'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable ExpenseForm component with dynamic Tank dropdown from TankContext.
 * Displays user-essential fields ONLY: tankId, category, amount, paymentMode, date, notes.
 * Tank display NEVER includes water source (e.g. Borewell).
 */
export const ExpenseForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks } = useTanks();
  const isEditing = Boolean(initialData?.id);

  // Clean tank labels so water source is NEVER exposed
  const tankSelectOptions = tanks.map((tank) => {
    const rawName = tank.name || tank.tankName || 'Tank';
    const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
    const areaSuffix = tank.area ? ` (${tank.area} Acres)` : '';
    return {
      value: tank.id,
      label: `${cleanName}${areaSuffix}`,
    };
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      tankId: '',
      category: '',
      amount: '',
      paymentMode: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        category: initialData.category || '',
        amount: initialData.amount || '',
        paymentMode: initialData.paymentMode || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);
    const rawTankName = selectedTankObj ? selectedTankObj.name : 'Selected Pond';
    const cleanTankName = rawTankName.replace(/\s*\([^)]*\)/g, '').trim();

    // Backend Request Model: { tankId, category, description, amount, paymentMode, date, notes }
    const expensePayload = {
      tankId: data.tankId,
      category: data.category,
      description: data.category, // Internally populate description using category for API compatibility
      amount: parseFloat(data.amount),
      paymentMode: data.paymentMode,
      date: data.date,
      notes: data.notes ? data.notes.trim() : '',
    };

    if (onSubmit) {
      onSubmit({
        ...expensePayload,
        tankName: cleanTankName,
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
            label="Tank"
            required={true}
            placeholder="Choose tank..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />

          <Select
            label="Expense Category"
            required={true}
            placeholder="Select category..."
            options={EXPENSE_CATEGORY_OPTIONS}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>
      </div>

      {/* SECTION 2: TRANSACTION DETAILS */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5" /> Transaction Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="1"
            placeholder="e.g. 2500"
            required={true}
            icon={<IndianRupee className="w-4 h-4 text-primary" />}
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Select
            label="Payment Mode"
            required={true}
            placeholder="Select mode..."
            options={PAYMENT_MODE_OPTIONS}
            error={errors.paymentMode?.message}
            {...register('paymentMode')}
          />

          <Input
            label="Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4 text-primary" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>
      </div>

      {/* SECTION 3: NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add transaction details, invoice number, vendor name..."
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
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isEditing ? (isSubmitting ? 'Updating...' : 'Update Expense') : (isSubmitting ? 'Recording...' : 'Save Expense Record')}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
