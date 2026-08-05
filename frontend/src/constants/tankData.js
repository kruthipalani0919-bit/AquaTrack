export const WATER_SOURCE_OPTIONS = [
  { value: 'Borewell', label: 'Borewell Water' },
  { value: 'Creek', label: 'Estuarine / Creek Water' },
  { value: 'Canal', label: 'Irrigation Canal' },
  { value: 'Seawater Intake', label: 'Direct Seawater Intake' },
];

export const TANK_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active / Stocked' },
  { value: 'Preparation', label: 'Pond Preparation' },
  { value: 'Maintenance', label: 'Maintenance / Dry' },
];

export const MOCK_TANKS = [
  {
    id: 'tank-1',
    name: 'Tank 1',
    area: 0,
    depth: 0,
    waterSource: 'Borewell',
    status: 'Active',
    remarks: '',
    createdAt: '2026-01-10',
    lastTested: '2026-08-04',
  },
  {
    id: 'tank-2',
    name: 'Tank 2',
    area: 0,
    depth: 0,
    waterSource: 'Creek',
    status: 'Active',
    remarks: '',
    createdAt: '2026-01-15',
    lastTested: '2026-08-03',
  },
  {
    id: 'tank-3',
    name: 'Tank 3',
    area: 0,
    depth: 0,
    waterSource: 'Canal',
    status: 'Active',
    remarks: '',
    createdAt: '2026-02-01',
    lastTested: '2026-08-04',
  },
  {
    id: 'tank-4',
    name: 'Tank 4',
    area: 0,
    depth: 0,
    waterSource: 'Borewell',
    status: 'Preparation',
    remarks: '',
    createdAt: '2026-03-12',
    lastTested: '2026-08-01',
  },
  {
    id: 'tank-5',
    name: 'Tank 5',
    area: 0,
    depth: 0,
    waterSource: 'Borewell',
    status: 'Active',
    remarks: '',
    createdAt: '2026-04-05',
    lastTested: '2026-08-05',
  },
  {
    id: 'tank-6',
    name: 'Tank 6',
    area: 0,
    depth: 0,
    waterSource: 'Seawater Intake',
    status: 'Maintenance',
    remarks: '',
    createdAt: '2026-02-20',
    lastTested: '2026-07-28',
  },
];

export default MOCK_TANKS;
