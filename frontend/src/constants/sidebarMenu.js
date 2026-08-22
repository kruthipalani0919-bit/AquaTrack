import {
  LayoutDashboard,
  Building2,
  MapPin,
  Container,
  Sprout,
  Boxes,
  UtensilsCrossed,
  Stethoscope,
  Receipt,
  Wheat,
  FileSpreadsheet
} from 'lucide-react';

export const SIDEBAR_MENU_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Farm Setup', path: '/farm-setup', icon: Building2 },
  { label: 'Sites', path: '/sites', icon: MapPin },
  { label: 'Tanks', path: '/tanks', icon: Container },
  { label: 'Crop Management', path: '/crops', icon: Sprout },
  { label: 'Stocking Management', path: '/stocking', icon: Boxes },
  { label: 'Feed Management', path: '/feed', icon: UtensilsCrossed },
  { label: 'Medicines', path: '/medicines', icon: Stethoscope },
  { label: 'Expenses', path: '/expenses', icon: Receipt },
  { label: 'Harvest', path: '/harvest', icon: Wheat },
  { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
];

export default SIDEBAR_MENU_ITEMS;
