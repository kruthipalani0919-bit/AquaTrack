import {
  LayoutDashboard,
  Building2,
  Container,
  Sprout,
  UtensilsCrossed,
  Stethoscope,
  Receipt,
  Wheat,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

export const SIDEBAR_MENU_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Farm Setup', path: '/farm-setup', icon: Building2 },
  { label: 'Tanks', path: '/tanks', icon: Container },
  { label: 'Crop Management', path: '/crops', icon: Sprout },
  { label: 'Feed Management', path: '/feed', icon: UtensilsCrossed },
  { label: 'Medicines', path: '/medicines', icon: Stethoscope },
  { label: 'Expenses', path: '/expenses', icon: Receipt },
  { label: 'Harvest', path: '/harvest', icon: Wheat },
  { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default SIDEBAR_MENU_ITEMS;
