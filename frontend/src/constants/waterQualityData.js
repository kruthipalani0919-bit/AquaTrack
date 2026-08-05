export const SAFE_WATER_RANGES = {
  ph: { minOptimal: 7.5, maxOptimal: 8.5, minWarning: 7.0, maxWarning: 9.0, unit: '' },
  dissolvedOxygen: { minOptimal: 5.0, minWarning: 3.5, unit: 'mg/L' },
  temperature: { minOptimal: 26.0, maxOptimal: 31.0, minWarning: 24.0, maxWarning: 33.0, unit: '°C' },
  salinity: { minOptimal: 10.0, maxOptimal: 25.0, unit: 'ppt' },
  ammonia: { maxOptimal: 0.10, maxWarning: 0.50, unit: 'ppm' },
  nitrite: { maxOptimal: 0.20, maxWarning: 1.00, unit: 'ppm' },
  alkalinity: { minOptimal: 100, maxOptimal: 150, unit: 'ppm' },
  waterLevel: { minOptimal: 1.2, maxOptimal: 2.0, unit: 'm' },
};

export const WATER_STATUS_OPTIONS = [
  { value: 'Normal', label: 'Normal (Optimal)' },
  { value: 'Warning', label: 'Warning (Sub-Optimal)' },
  { value: 'Critical', label: 'Critical (Action Required)' },
];

export const MOCK_WATER_RECORDS = [
  {
    id: 'water-1',
    tankId: 'tank-1',
    tankName: 'Pond P-1 (Vannamei Main)',
    testDate: '2026-08-05',
    testTime: '06:30 AM',
    ph: 7.9,
    temperature: 28.5,
    dissolvedOxygen: 6.5,
    salinity: 15.0,
    ammonia: 0.05,
    nitrite: 0.08,
    alkalinity: 125,
    waterLevel: 1.8,
    status: 'Normal',
    notes: 'Morning parameters optimal. Aerators operated 100% efficiency.',
    createdAt: '2026-08-05',
  },
  {
    id: 'water-2',
    tankId: 'tank-2',
    tankName: 'Pond P-2 (South Sector)',
    testDate: '2026-08-05',
    testTime: '06:30 AM',
    ph: 8.2,
    temperature: 29.1,
    dissolvedOxygen: 4.2, // Warning range DO
    salinity: 16.5,
    ammonia: 0.15,
    nitrite: 0.25,
    alkalinity: 110,
    waterLevel: 1.6,
    status: 'Warning',
    notes: 'DO slightly low in morning. Increased paddlewheel aerator runtime.',
    createdAt: '2026-08-05',
  },
  {
    id: 'water-3',
    tankId: 'tank-3',
    tankName: 'Pond P-3 (North Field)',
    testDate: '2026-08-05',
    testTime: '07:00 AM',
    ph: 7.7,
    temperature: 28.0,
    dissolvedOxygen: 5.8,
    salinity: 14.0,
    ammonia: 0.04,
    nitrite: 0.06,
    alkalinity: 130,
    waterLevel: 1.9,
    status: 'Normal',
    notes: 'Clear green phytoplankton bloom observed.',
    createdAt: '2026-08-05',
  },
  {
    id: 'water-4',
    tankId: 'tank-4',
    tankName: 'Pond P-4 (Prep Phase)',
    testDate: '2026-08-04',
    testTime: '04:00 PM',
    ph: 9.2, // Critical pH
    temperature: 32.5,
    dissolvedOxygen: 3.1, // Critical DO
    salinity: 18.0,
    ammonia: 0.65, // Critical Ammonia
    nitrite: 1.10,
    alkalinity: 90,
    waterLevel: 1.3,
    status: 'Critical',
    notes: 'High pH spike and elevated ammonia. Immediate water exchange and liming required.',
    createdAt: '2026-08-04',
  },
  {
    id: 'water-5',
    tankId: 'tank-5',
    tankName: 'Nursery Tank N-1',
    testDate: '2026-08-05',
    testTime: '08:00 AM',
    ph: 8.0,
    temperature: 27.8,
    dissolvedOxygen: 7.2,
    salinity: 15.0,
    ammonia: 0.02,
    nitrite: 0.04,
    alkalinity: 140,
    waterLevel: 1.4,
    status: 'Normal',
    notes: 'Micro-aeration grid maintaining excellent DO levels.',
    createdAt: '2026-08-05',
  },
];

// Mock Trend Datasets for Recharts
export const PH_TREND_DATA = [
  { time: 'Aug 01', 'Pond P-1': 7.8, 'Pond P-2': 8.0, 'Pond P-3': 7.6 },
  { time: 'Aug 02', 'Pond P-1': 7.9, 'Pond P-2': 8.1, 'Pond P-3': 7.7 },
  { time: 'Aug 03', 'Pond P-1': 8.0, 'Pond P-2': 8.3, 'Pond P-3': 7.8 },
  { time: 'Aug 04', 'Pond P-1': 7.8, 'Pond P-2': 8.4, 'Pond P-3': 7.6 },
  { time: 'Aug 05', 'Pond P-1': 7.9, 'Pond P-2': 8.2, 'Pond P-3': 7.7 },
];

export const TEMP_TREND_DATA = [
  { time: 'Aug 01', 'Pond P-1': 28.0, 'Pond P-2': 28.5, 'Pond P-3': 27.8 },
  { time: 'Aug 02', 'Pond P-1': 28.5, 'Pond P-2': 29.0, 'Pond P-3': 28.1 },
  { time: 'Aug 03', 'Pond P-1': 29.0, 'Pond P-2': 29.5, 'Pond P-3': 28.4 },
  { time: 'Aug 04', 'Pond P-1': 28.8, 'Pond P-2': 29.2, 'Pond P-3': 28.2 },
  { time: 'Aug 05', 'Pond P-1': 28.5, 'Pond P-2': 29.1, 'Pond P-3': 28.0 },
];

export const DO_TREND_DATA = [
  { time: 'Aug 01', 'Pond P-1': 6.2, 'Pond P-2': 5.0, 'Pond P-3': 5.6 },
  { time: 'Aug 02', 'Pond P-1': 6.4, 'Pond P-2': 4.8, 'Pond P-3': 5.7 },
  { time: 'Aug 03', 'Pond P-1': 6.0, 'Pond P-2': 4.5, 'Pond P-3': 5.9 },
  { time: 'Aug 04', 'Pond P-1': 6.3, 'Pond P-2': 4.3, 'Pond P-3': 5.5 },
  { time: 'Aug 05', 'Pond P-1': 6.5, 'Pond P-2': 4.2, 'Pond P-3': 5.8 },
];

export default MOCK_WATER_RECORDS;
