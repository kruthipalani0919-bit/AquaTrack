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
    farmName: 'Farm',
    ownerName: 'Owner',
    location: 'Location',
    district: 'District',
    state: 'State',
    totalAcres: 0,
  },

  // 2. Statistics Section
  statistics: {
    totalAcres: 0,
    totalTanks: 6,
    activeTanks: 4,
    totalCrops: 4,
    activeCrops: 4,
    feedConsumedKg: 0,
    totalExpenses: 0,
    expectedHarvestTons: 0,
    projectedRevenue: 0,
  },

  // 3. Financial Summary Section
  financialSummary: {
    expenseTrend: [
      { month: 'Jan', feed: 0, power: 0, meds: 0, total: 0 },
      { month: 'Feb', feed: 0, power: 0, meds: 0, total: 0 },
      { month: 'Mar', feed: 0, power: 0, meds: 0, total: 0 },
      { month: 'Apr', feed: 0, power: 0, meds: 0, total: 0 },
      { month: 'May', feed: 0, power: 0, meds: 0, total: 0 },
      { month: 'Jun', feed: 0, power: 0, meds: 0, total: 0 },
    ],
    feedConsumption: [
      { pond: 'Tank 1', starterFeed: 0, growerFeed: 0, total: 0 },
      { pond: 'Tank 2', starterFeed: 0, growerFeed: 0, total: 0 },
      { pond: 'Tank 3', starterFeed: 0, growerFeed: 0, total: 0 },
      { pond: 'Tank 4', starterFeed: 0, growerFeed: 0, total: 0 },
      { pond: 'Tank 5', starterFeed: 0, growerFeed: 0, total: 0 },
    ],
  },

  // 4. Entry Counts Section
  entryCounts: {
    tankCount: 6,
    cropCount: 4,
    feedLogCount: 5,
    waterQualityLogCount: 5,
    medicineLogCount: 5,
  },

  // 5. Current Active Crop Overview Section
  activeCropOverview: {
    activeCropCount: 4,
    avgDocDays: 0,
    activeCropsList: [
      {
        id: 'crop-1',
        cropName: 'Crop 1',
        tankName: 'Tank 1',
        docDays: 0,
        progressPercent: 0,
        plCount: 0,
        expectedProductionKg: 0,
        expectedSellingPricePerKg: 0,
        estimatedRevenue: 0,
      },
    ],
  },
};

export const DASHBOARD_STATS = [
  {
    id: 'acres',
    title: 'Total Acres',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.totalAcres} Acres`,
    description: 'Total land area',
    icon: Layers,
    color: 'text-teal-600 bg-teal-50',
    trend: '0%',
    trendPositive: true,
  },
  {
    id: 'tanks',
    title: 'Total Tanks',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.totalTanks} Tanks`,
    description: `${MOCK_DASHBOARD_RESPONSE.statistics.activeTanks} active`,
    icon: Container,
    color: 'text-cyan-600 bg-cyan-50',
    trend: 'Operational',
    trendPositive: true,
  },
  {
    id: 'crops',
    title: 'Active Crops',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.activeCrops} Crops`,
    description: 'Active culture batches',
    icon: Sprout,
    color: 'text-emerald-600 bg-emerald-50',
    trend: 'Active',
    trendPositive: true,
  },
  {
    id: 'feed',
    title: 'Feed Consumed',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.feedConsumedKg} kg`,
    description: 'Total feed consumption',
    icon: UtensilsCrossed,
    color: 'text-blue-600 bg-blue-50',
    trend: 'Tracked',
    trendPositive: true,
  },
  {
    id: 'expenses',
    title: 'Total Expenses',
    value: `₹${MOCK_DASHBOARD_RESPONSE.statistics.totalExpenses}`,
    description: 'Operating cost breakdown',
    icon: Receipt,
    color: 'text-indigo-600 bg-indigo-50',
    trend: 'Tracked',
    trendPositive: true,
  },
  {
    id: 'harvest',
    title: 'Expected Harvest',
    value: `${MOCK_DASHBOARD_RESPONSE.statistics.expectedHarvestTons} Tons`,
    description: `Projected Revenue: ₹${MOCK_DASHBOARD_RESPONSE.statistics.projectedRevenue}`,
    icon: Wheat,
    color: 'text-amber-600 bg-amber-50',
    trend: 'Projected',
    trendPositive: true,
  },
];

export const EXPENSE_TREND_DATA = MOCK_DASHBOARD_RESPONSE.financialSummary.expenseTrend;
export const FEED_CONSUMPTION_DATA = MOCK_DASHBOARD_RESPONSE.financialSummary.feedConsumption;

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Water Quality Recorded',
    details: 'Parameters logged for Tank 1',
    time: 'Recent',
    icon: Waves,
    badgeVariant: 'primary',
    category: 'Water Quality',
  },
  {
    id: 2,
    title: 'Feed Logged',
    details: 'Ration applied for Tank 2',
    time: 'Recent',
    icon: UtensilsCrossed,
    badgeVariant: 'success',
    category: 'Feed Management',
  },
  {
    id: 3,
    title: 'Treatment Recorded',
    details: 'Application logged for Tank 4',
    time: 'Recent',
    icon: Stethoscope,
    badgeVariant: 'secondary',
    category: 'Medicines',
  },
];

export const UPCOMING_REMINDERS = [
  {
    id: 1,
    title: 'Water Sampling Check',
    description: 'Perform routine parameter testing',
    dueDate: 'Scheduled',
    status: 'High Priority',
    statusColor: 'danger',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Equipment Maintenance Check',
    description: 'Inspect motors and aerators',
    dueDate: 'Scheduled',
    status: 'Medium Priority',
    statusColor: 'warning',
    icon: AlertCircle,
  },
];

export default MOCK_DASHBOARD_RESPONSE;
