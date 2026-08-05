import {
  Layers,
  Container,
  Sprout,
  UtensilsCrossed,
  Receipt,
  Wheat,
  Waves,
  Stethoscope,
  Clock,
  AlertCircle
} from 'lucide-react';

/**
 * Mock Dashboard Response structured strictly matching the backend contract: GET /api/dashboard
 */
export const MOCK_DASHBOARD_RESPONSE = {
  // 1. Farm Details Section (POST /api/farms contract)
  farmDetails: {
    farmName: 'BlueWave Aqua Farm',
    ownerName: 'Rajesh Kumar',
    location: 'Coastal Road, Village X',
    district: 'Nellore',
    state: 'Andhra Pradesh',
    totalAcres: 18.5,
  },

  // 2. Statistics Section
  statistics: {
    totalAcres: 18.5,
    totalTanks: 8,
    activeTanks: 6,
    totalCrops: 6,
    activeCrops: 4,
    feedConsumedKg: 1450,
    totalExpenses: 12480,
    expectedHarvestTons: 14.2,
    projectedRevenue: 71000,
  },

  // 3. Financial Summary Section
  financialSummary: {
    expenseTrend: [
      { month: 'Jan', feed: 3200, power: 1100, meds: 600, total: 4900 },
      { month: 'Feb', feed: 3800, power: 1250, meds: 750, total: 5800 },
      { month: 'Mar', feed: 4200, power: 1400, meds: 900, total: 6500 },
      { month: 'Apr', feed: 4600, power: 1350, meds: 800, total: 6750 },
      { month: 'May', feed: 5100, power: 1500, meds: 1100, total: 7700 },
      { month: 'Jun', feed: 5800, power: 1650, meds: 1200, total: 8650 },
    ],
    feedConsumption: [
      { pond: 'Pond P-1', starterFeed: 180, growerFeed: 320, total: 500 },
      { pond: 'Pond P-2', starterFeed: 220, growerFeed: 280, total: 500 },
      { pond: 'Pond P-3', starterFeed: 150, growerFeed: 350, total: 500 },
      { pond: 'Pond P-4', starterFeed: 190, growerFeed: 310, total: 500 },
      { pond: 'Pond P-5', starterFeed: 140, growerFeed: 260, total: 400 },
    ],
  },

  // 4. Entry Counts Section
  entryCounts: {
    tankCount: 8,
    cropCount: 6,
    feedLogCount: 5,
    waterQualityLogCount: 1,
    medicineLogCount: 1,
  },

  // 5. Current Active Crop Overview Section
  activeCropOverview: {
    activeCropCount: 4,
    avgDocDays: 48,
    activeCropsList: [
      {
        id: 'crop-1',
        cropName: 'Vannamei Season 2026 Batch A',
        tankName: 'Pond P-1 (Vannamei Main)',
        docDays: 48,
        progressPercent: 40,
        plCount: 150000,
        expectedProductionKg: 3500,
        expectedSellingPricePerKg: 420,
        estimatedRevenue: 1470000,
      },
    ],
  },
};

export const DASHBOARD_STATS = [
  {
    id: 'acres',
    title: 'Total Acres',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.totalAcres} Acres`,
    description: '+2.5 Acres expanded this quarter',
    icon: Layers,
    color: 'text-teal-600 bg-teal-50',
    trend: '+15%',
    trendPositive: true,
  },
  {
    id: 'tanks',
    title: 'Total Tanks',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.totalTanks} Active Ponds`,
    description: `${MOCK_DASHBOARD_RESPONSE.statistics.activeTanks} stocked, 2 in preparation`,
    icon: Container,
    color: 'text-cyan-600 bg-cyan-50',
    trend: '100% Operational',
    trendPositive: true,
  },
  {
    id: 'crops',
    title: 'Active Crops',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.activeCrops} Batches`,
    description: `Vannamei species (Avg DOC: ${MOCK_DASHBOARD_RESPONSE.activeCropOverview.avgDocDays}d)`,
    icon: Sprout,
    color: 'text-emerald-600 bg-emerald-50',
    trend: 'Optimal Growth',
    trendPositive: true,
  },
  {
    id: 'feed',
    title: 'Feed Consumed',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.feedConsumedKg.toLocaleString()} kg`,
    description: 'Average FCR: 1.24 ratio',
    icon: UtensilsCrossed,
    color: 'text-blue-600 bg-blue-50',
    trend: '-3% FCR reduction',
    trendPositive: true,
  },
  {
    id: 'expenses',
    title: 'Total Expenses',
    value: `$${MOCK_DASHBOARD_RESPONSE.statistics.totalExpenses.toLocaleString()}`,
    description: 'Feed 62%, Power 20%, Meds 18%',
    icon: Receipt,
    color: 'text-indigo-600 bg-indigo-50',
    trend: 'Within budget',
    trendPositive: true,
  },
  {
    id: 'harvest',
    title: 'Expected Harvest',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.expectedHarvestTons} Tons`,
    description: `Projected Revenue: $${MOCK_DASHBOARD_RESPONSE.statistics.projectedRevenue.toLocaleString()}`,
    icon: Wheat,
    color: 'text-amber-600 bg-amber-50',
    trend: '+8% vs last harvest',
    trendPositive: true,
  },
];

export const EXPENSE_TREND_DATA = MOCK_DASHBOARD_RESPONSE.financialSummary.expenseTrend;
export const FEED_CONSUMPTION_DATA = MOCK_DASHBOARD_RESPONSE.financialSummary.feedConsumption;

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Water Quality Logged',
    details: 'pH: 7.8, DO: 6.8 mg/L, Salinity: 15 ppt logged for Pond P-1',
    time: '25 mins ago',
    icon: Waves,
    badgeVariant: 'primary',
    category: 'Water Quality',
  },
  {
    id: 2,
    title: 'Feed Rations Distributed',
    details: '180 kg Grower Pellet feed applied across Ponds P-2 and P-3',
    time: '1 hour ago',
    icon: UtensilsCrossed,
    badgeVariant: 'success',
    category: 'Feed Management',
  },
  {
    id: 3,
    title: 'Probiotic Supplement Administered',
    details: '5 kg Aqua-Gut Probiotic dosed into Pond P-4',
    time: '3 hours ago',
    icon: Stethoscope,
    badgeVariant: 'secondary',
    category: 'Medicines',
  },
  {
    id: 4,
    title: 'Electricity & Utility Expense Added',
    details: 'Logged $1,240 invoice for June aerator grid power',
    time: '5 hours ago',
    icon: Receipt,
    badgeVariant: 'warning',
    category: 'Expenses',
  },
  {
    id: 5,
    title: 'Sample Harvest Weight Check',
    details: 'Mean Body Weight (ABW) measured at 18.5g in Pond P-1',
    time: 'Yesterday',
    icon: Wheat,
    badgeVariant: 'accent',
    category: 'Harvest',
  },
];

export const UPCOMING_REMINDERS = [
  {
    id: 1,
    title: 'Evening DO & pH Sampling',
    description: 'Check dissolved oxygen levels before aerator cycle',
    dueDate: 'Today, 4:00 PM',
    status: 'High Priority',
    statusColor: 'danger',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Aerator Motor Service Check',
    description: 'Inspect gearbox oil levels for Pond P-2 & P-3 aerators',
    dueDate: 'Tomorrow, 10:00 AM',
    status: 'Medium Priority',
    statusColor: 'warning',
    icon: AlertCircle,
  },
  {
    id: 3,
    title: 'Soil Alkalinity Testing',
    description: 'Collect bottom sludge samples for pond preparation',
    dueDate: 'Aug 07, 2026',
    status: 'Scheduled',
    statusColor: 'primary',
    icon: Layers,
  },
  {
    id: 4,
    title: 'Feed Inventory Re-stock',
    description: 'Order 50 bags of High-Protein Shrimp Grower #3',
    dueDate: 'Aug 09, 2026',
    status: 'Pending',
    statusColor: 'neutral',
    icon: UtensilsCrossed,
  },
];

export default MOCK_DASHBOARD_RESPONSE;
