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
    name: 'Pond P-1 (Vannamei Main)',
    area: 2.5, // Acres
    depth: 1.8, // Meters
    waterSource: 'Borewell',
    status: 'Active',
    remarks: 'Stocked with 150,000 Vannamei PL on June 15. DOC: 48 days. Aerators operating 16 hrs/day.',
    createdAt: '2026-01-10',
    lastTested: '2026-08-04',
  },
  {
    id: 'tank-2',
    name: 'Pond P-2 (South Sector)',
    area: 2.0,
    depth: 1.5,
    waterSource: 'Creek',
    status: 'Active',
    remarks: 'Stocked with 120,000 PL. Excellent water bloom and natural feed availability.',
    createdAt: '2026-01-15',
    lastTested: '2026-08-03',
  },
  {
    id: 'tank-3',
    name: 'Pond P-3 (North Field)',
    area: 3.0,
    depth: 2.0,
    waterSource: 'Canal',
    status: 'Active',
    remarks: 'Stocked with 180,000 PL. Regular alkalinity and calcium dosing active.',
    createdAt: '2026-02-01',
    lastTested: '2026-08-04',
  },
  {
    id: 'tank-4',
    name: 'Pond P-4 (Prep Phase)',
    area: 2.5,
    depth: 1.8,
    waterSource: 'Borewell',
    status: 'Preparation',
    remarks: 'Bottom soil dried, liming completed. Refilling water and preparing phytoplankton bloom.',
    createdAt: '2026-03-12',
    lastTested: '2026-08-01',
  },
  {
    id: 'tank-5',
    name: 'Nursery Tank N-1',
    area: 1.0,
    depth: 1.4,
    waterSource: 'Borewell',
    status: 'Active',
    remarks: 'High-density nursery rearing tank with micro-aeration grid.',
    createdAt: '2026-04-05',
    lastTested: '2026-08-05',
  },
  {
    id: 'tank-6',
    name: 'Pond P-5 (Dry Dock)',
    area: 1.8,
    depth: 1.6,
    waterSource: 'Seawater Intake',
    status: 'Maintenance',
    remarks: 'Drained post harvest. Aerator overhaul and dike wall repairs underway.',
    createdAt: '2026-02-20',
    lastTested: '2026-07-28',
  },
];

export default MOCK_TANKS;
