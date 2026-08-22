export const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'Pond Preparation', label: 'Pond Preparation' },
  { value: 'Seed Cost', label: 'Seed Cost' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Generator & Diesel', label: 'Generator & Diesel' },
  { value: 'Labour', label: 'Labour' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Salaries', label: 'Salaries' },
];

export const PAYMENT_MODE_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI / Net Banking', label: 'UPI / Net Banking' },
];

export const MOCK_EXPENSES = [
  {
    id: 'exp-1',
    tankId: 'tank-1',
    tankName: 'Tank 1',
    category: 'Electricity',
    description: 'Electricity Bill',
    amount: 0,
    paymentMode: 'UPI / Net Banking',
    date: '2026-08-05',
    notes: '',
    createdAt: '2026-08-05',
  },
  {
    id: 'exp-2',
    tankId: 'tank-1',
    tankName: 'Tank 1',
    category: 'Generator & Diesel',
    description: 'Diesel Expense',
    amount: 0,
    paymentMode: 'Cash',
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
    paymentMode: 'Cash',
    date: '2026-08-03',
    notes: '',
    createdAt: '2026-08-03',
  },
  {
    id: 'exp-4',
    tankId: 'tank-3',
    tankName: 'Tank 3',
    category: 'Salaries',
    description: 'Staff Salaries',
    amount: 0,
    paymentMode: 'UPI / Net Banking',
    date: '2026-08-02',
    notes: '',
    createdAt: '2026-08-02',
  },
];

export default MOCK_EXPENSES;
