export const DEFAULT_FARM_INFO = {
  farmName: 'Farm',
  ownerName: 'Owner',
  location: 'Location',
  district: 'District',
  state: 'State',
  totalAcres: 0,
};

export const WATER_SOURCE_OPTIONS = [
  { value: 'Borewell', label: 'Borewell Water' },
  { value: 'Creek', label: 'Estuarine / Creek Water' },
  { value: 'Canal', label: 'Irrigation Canal' },
  { value: 'Seawater Intake', label: 'Direct Seawater Intake' },
];

export const CROP_SPECIES_OPTIONS = [
  { value: 'Penaeus vannamei', label: 'Penaeus vannamei (Whiteleg Shrimp)' },
  { value: 'Penaeus monodon', label: 'Penaeus monodon (Black Tiger)' },
  { value: 'Macrobrachium rosenbergii', label: 'Freshwater Prawn (Scampi)' },
];

export const FEED_BRAND_OPTIONS = [
  { value: 'CP Feeds', label: 'CP Aqua Feeds' },
  { value: 'Avanti Feeds', label: 'Avanti Feeds' },
  { value: 'Grobest', label: 'Grobest Shrimp Feed' },
  { value: 'Godrej Agrovet', label: 'Godrej Aqua Feed' },
];

export default DEFAULT_FARM_INFO;
