export const FEED_BRAND_OPTIONS = [
  { value: 'CP Feeds', label: 'CP Aqua Feeds' },
  { value: 'Avanti Feeds', label: 'Avanti Feeds' },
  { value: 'Grobest', label: 'Grobest Shrimp Feed' },
  { value: 'Godrej Agrovet', label: 'Godrej Aqua Feed' },
];

export const FEED_TYPE_OPTIONS = [
  { value: 'Starter Pellet #1', label: 'Starter Pellet #1 (0.8mm)' },
  { value: 'Grower Pellet #2', label: 'Grower Pellet #2 (1.2mm)' },
  { value: 'Finisher Pellet #3', label: 'Finisher Pellet #3 (1.6mm)' },
  { value: 'Micro Feed', label: 'Micro Nursery Feed' },
  { value: 'Crumb Feed', label: 'Crumb Feed' },
];

export const FEEDING_TIME_OPTIONS = [
  { value: '06:00 AM', label: '06:00 AM (Morning Feed)' },
  { value: '11:00 AM', label: '11:00 AM (Noon Feed)' },
  { value: '03:00 PM', label: '03:00 PM (Afternoon Feed)' },
  { value: '07:00 PM', label: '07:00 PM (Evening Feed)' },
];

export const FEED_STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Missed', label: 'Missed' },
];

export const MOCK_FEED_LOGS = [
  {
    id: 'feed-1',
    cropId: 'crop-1',
    cropName: 'Vannamei Season 2026 Batch A',
    tankId: 'tank-1',
    tankName: 'Pond P-1 (Vannamei Main)',
    feedBrand: 'CP Feeds',
    feedType: 'Grower Pellet #2',
    quantityKg: 45,
    feedingDate: '2026-08-05',
    feedingTime: '06:00 AM',
    feedCost: 3150, // ₹ 70/kg
    remainingStockKg: 450,
    status: 'Completed',
    notes: 'Tray check clean at 08:00 AM. Consumption 100%.',
    createdAt: '2026-08-05',
  },
  {
    id: 'feed-2',
    cropId: 'crop-1',
    cropName: 'Vannamei Season 2026 Batch A',
    tankId: 'tank-1',
    tankName: 'Pond P-1 (Vannamei Main)',
    feedBrand: 'CP Feeds',
    feedType: 'Grower Pellet #2',
    quantityKg: 45,
    feedingDate: '2026-08-05',
    feedingTime: '11:00 AM',
    feedCost: 3150,
    remainingStockKg: 405,
    status: 'Completed',
    notes: 'Check tray showed minor leftover (approx 5%). Adjusted afternoon ration slightly.',
    createdAt: '2026-08-05',
  },
  {
    id: 'feed-3',
    cropId: 'crop-2',
    cropName: 'Vannamei Summer Crop 2',
    tankId: 'tank-2',
    tankName: 'Pond P-2 (South Sector)',
    feedBrand: 'Avanti Feeds',
    feedType: 'Starter Pellet #1',
    quantityKg: 30,
    feedingDate: '2026-08-05',
    feedingTime: '06:00 AM',
    feedCost: 2250, // ₹ 75/kg
    remainingStockKg: 320,
    status: 'Completed',
    notes: 'Good feeding response around pond edge.',
    createdAt: '2026-08-05',
  },
  {
    id: 'feed-4',
    cropId: 'crop-3',
    cropName: 'Black Tiger Premium Cultivation',
    tankId: 'tank-3',
    tankName: 'Pond P-3 (North Field)',
    feedBrand: 'Grobest',
    feedType: 'Finisher Pellet #3',
    quantityKg: 60,
    feedingDate: '2026-08-04',
    feedingTime: '03:00 PM',
    feedCost: 4800, // ₹ 80/kg
    remainingStockKg: 580,
    status: 'Completed',
    notes: 'Applied with vitamin C supplement coat.',
    createdAt: '2026-08-04',
  },
  {
    id: 'feed-5',
    cropId: 'crop-1',
    cropName: 'Vannamei Season 2026 Batch A',
    tankId: 'tank-1',
    tankName: 'Pond P-1 (Vannamei Main)',
    feedBrand: 'CP Feeds',
    feedType: 'Grower Pellet #2',
    quantityKg: 45,
    feedingDate: '2026-08-05',
    feedingTime: '03:00 PM',
    feedCost: 3150,
    remainingStockKg: 360,
    status: 'Scheduled',
    notes: 'Afternoon ration to be distributed by team.',
    createdAt: '2026-08-05',
  },
];

export default MOCK_FEED_LOGS;
