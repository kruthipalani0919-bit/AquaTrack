import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Calendar, IndianRupee, CreditCard, FileText } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import {
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_MODE_OPTIONS
} from '../../constants/expenseData';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/expenses)
const expenseSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  category: z
    .string()
    .min(1, 'Please select an Expense Category'),
  description: z
    .string()
    .min(1, 'Description is required')
    .trim(),
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
 * Contains ONLY backend-supported fields: tankId, category, description, amount, paymentMode, date, notes.
 */
export const ExpenseForm = ({
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
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      tankId: '',
      category: '',
      description: '',
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
        description: initialData.description || '',
        amount: initialData.amount || '',
        paymentMode: initialData.paymentMode || '',
        date: initialData.date || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Backend Request Model: { tankId, category, description, amount, paymentMode, date, notes }
    const expensePayload = {
      tankId: data.tankId,
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      paymentMode: data.paymentMode,
      date: data.date,
      notes: data.notes ? data.notes.trim() : '',
    };

    console.log('Backend Expense Payload:', expensePayload);

    if (onSubmit) {
      onSubmit({
        ...expensePayload,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Tank',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Tank Select & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Pond / Tank"
          required={true}
          placeholder="Choose pond..."
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

      {/* Description */}
      <Input
        label="Description"
        type="text"
        placeholder="e.g. Electricity bill / Feed purchase"
        required={true}
        icon={<FileText className="w-4 h-4" />}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Amount, Payment Mode, & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Amount (₹)"
          type="number"
          step="1"
          placeholder="e.g. 2500"
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
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
          icon={<Calendar className="w-4 h-4" />}
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Notes & Observations (Optional)"
        placeholder="Add transaction details, invoice number, vendor name..."
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
          {isEditing ? 'Update Expense' : 'Save Expense Record'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
