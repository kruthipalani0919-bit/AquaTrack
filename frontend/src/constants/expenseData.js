export const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'Pond Lease', label: 'Pond Lease' },
  { value: 'Pond Preparation', label: 'Pond Preparation' },
  { value: 'Seed Cost', label: 'Seed Cost' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Generator & Diesel', label: 'Generator & Diesel' },
  { value: 'Labour', label: 'Labour' },
  { value: 'Harvest', label: 'Harvest' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Medicine', label: 'Medicine' },
];

export const PAYMENT_MODE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank' },
  { value: 'CARD', label: 'Card' },
];

export const MOCK_EXPENSES = [
  {
    id: 'exp-1',
    tankId: 'tank-1',
    tankName: 'Tank 1',
    category: 'Feed',
    description: 'Feed Expense',
    amount: 0,
    paymentMode: 'BANK',
    date: '2026-08-05',
    notes: '',
    createdAt: '2026-08-05',
  },
  {
    id: 'exp-2',
    tankId: 'tank-1',
    tankName: 'Tank 1',
    category: 'Electricity',
    description: 'Electricity Bill',
    amount: 0,
    paymentMode: 'UPI',
    date: '2026-08-04',
    notes: '',
    createdAt: '2026-08-04',
  },
  {
    id: 'exp-3',
    tankId: 'tank-2',
    tankName: 'Tank 2',
    category: 'Labour',
    description: 'Labour Wages',
    amount: 0,
    paymentMode: 'CASH',
    date: '2026-08-03',
    notes: '',
    createdAt: '2026-08-03',
  },
  {
    id: 'exp-4',
    tankId: 'tank-3',
    tankName: 'Tank 3',
    category: 'Medicine',
    description: 'Chemical Sanitizer',
    amount: 0,
    paymentMode: 'UPI',
    date: '2026-08-02',
    notes: '',
    createdAt: '2026-08-02',
  },
];

export default MOCK_EXPENSES;
