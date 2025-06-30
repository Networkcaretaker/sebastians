// apps/menu/src/utils/allergyIcons.ts
import celeryIcon from '../assets/allergy_icons/celery.svg';
import cornIcon from '../assets/allergy_icons/corn.svg';
import crustaceansIcon from '../assets/allergy_icons/crustaceans.svg';
import eggsIcon from '../assets/allergy_icons/eggs.svg';
import fishIcon from '../assets/allergy_icons/fish.svg';
import glutenIcon from '../assets/allergy_icons/Gluten.svg';
import lupinIcon from '../assets/allergy_icons/lupin.svg';
import milkIcon from '../assets/allergy_icons/milk.svg';
import molluscIcon from '../assets/allergy_icons/mollusc.svg';
import mustardIcon from '../assets/allergy_icons/mustard.svg';
import nutsIcon from '../assets/allergy_icons/nuts.svg';
import peanutsIcon from '../assets/allergy_icons/peanuts.svg';
import propolisIcon from '../assets/allergy_icons/propolis.svg';
import sesameIcon from '../assets/allergy_icons/seseme.svg';
import soyaIcon from '../assets/allergy_icons/soya.svg';
import sulphitesIcon from '../assets/allergy_icons/sulphites.svg';

// Icon mapping object - maps allergy names to their corresponding SVG URLs
export const allergyIconMap: Record<string, string> = {
  // Standard allergy names (lowercase for consistency)
  'celery': celeryIcon,
  'corn': cornIcon,
  'crustaceans': crustaceansIcon,
  'eggs': eggsIcon,
  'fish': fishIcon,
  'gluten': glutenIcon,
  'lupin': lupinIcon,
  'milk': milkIcon,
  'mollusc': molluscIcon,
  'molluscs': molluscIcon, // Alternative spelling
  'mustard': mustardIcon,
  'nuts': nutsIcon,
  'tree nuts': nutsIcon, // Alternative name
  'peanuts': peanutsIcon,
  'propolis': propolisIcon,
  'sesame': sesameIcon,
  'seseme': sesameIcon, // Handle the filename spelling
  'soya': soyaIcon,
  'soy': soyaIcon, // Alternative name
  'sulphites': sulphitesIcon,
  'sulfites': sulphitesIcon, // US spelling
  
  // Additional common alternative names
  'dairy': milkIcon,
  'wheat': glutenIcon,
  'shellfish': crustaceansIcon,
};

// Helper function to get icon URL by allergy name
export const getAllergyIcon = (allergyName: string): string | null => {
  const normalizedName = allergyName.toLowerCase().trim();
  return allergyIconMap[normalizedName] || null;
};

// Helper function to check if an allergy has an icon
export const hasAllergyIcon = (allergyName: string): boolean => {
  const normalizedName = allergyName.toLowerCase().trim();
  return normalizedName in allergyIconMap;
};

// Get all available allergy names (for reference/debugging)
export const getAvailableAllergies = (): string[] => {
  return Object.keys(allergyIconMap);
};