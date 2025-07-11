// apps/menu/src/hooks/useTranslation.tsx
import { useLanguage } from '../contexts/LanguageContext';

// UI Text translations for hard-coded strings
const UI_TRANSLATIONS = {
  en: {
    // Labels
    from: 'from ',
    options: 'Options:',
    extras: 'Extras:',
    allergens: 'Allergens:',
    
    // Notice flags
    vegetarian: '🌱 Vegetarian',
    vegan: '🌱 Vegan',
    spicy: '🌶️ Spicy'
  },
  es: {
    // Labels
    from: 'desde ',
    options: 'Opciones:',
    extras: 'Extras:',
    allergens: 'Alérgenos:',
    
    // Notice flags
    vegetarian: '🌱 Vegetariano',
    vegan: '🌱 Vegano',
    spicy: '🌶️ Picante'
  },
  de: {
    // Labels
    from: 'ab ',
    options: 'Optionen:',
    extras: 'Extras:',
    allergens: 'Allergene:',
    
    // Notice flags
    vegetarian: '🌱 Vegetarisch',
    vegan: '🌱 Vegan',
    spicy: '🌶️ Scharf'
  }
  // Add more languages as needed
};

export const useTranslation = () => {
  const { currentLanguage, defaultLanguage } = useLanguage();

  // Function to get UI text translations
  const t = (key: string): string => {
    const translations = UI_TRANSLATIONS[currentLanguage as keyof typeof UI_TRANSLATIONS];
    const fallbackTranslations = UI_TRANSLATIONS[defaultLanguage as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS.en;
    
    return translations?.[key as keyof typeof translations] || 
           fallbackTranslations?.[key as keyof typeof fallbackTranslations] || 
           key;
  };

  // Simple function to get translated item name
  const getItemName = (item: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return item.item_name;
    }
    
    // Check if item has translations
    if (item.translations && item.translations[currentLanguage] && item.translations[currentLanguage].name) {
      return item.translations[currentLanguage].name;
    }
    
    // Fall back to original
    return item.item_name;
  };

  // Simple function to get translated item description
  const getItemDescription = (item: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return item.item_description || '';
    }
    
    // Check if item has translations
    if (item.translations && item.translations[currentLanguage] && item.translations[currentLanguage].description) {
      return item.translations[currentLanguage].description;
    }
    
    // Fall back to original
    return item.item_description || '';
  };

  // Simple function to get translated category name
  const getCategoryName = (category: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return category.cat_name;
    }
    
    // Check if category has translations
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].name) {
      return category.translations[currentLanguage].name;
    }
    
    // Fall back to original
    return category.cat_name;
  };

  // Simple function to get translated category header
  const getCategoryHeader = (category: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return category.cat_header || '';
    }
    
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].header) {
      return category.translations[currentLanguage].header;
    }
    
    return category.cat_header || '';
  };

  // Simple function to get translated category footer
  const getCategoryFooter = (category: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return category.cat_footer || '';
    }
    
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].footer) {
      return category.translations[currentLanguage].footer;
    }
    
    return category.cat_footer || '';
  };

  // Simple function to get translated option text
  const getOptionText = (item: any, optionIndex: number, originalOption: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalOption;
    }
    
    if (item.translations && 
        item.translations[currentLanguage] && 
        item.translations[currentLanguage].options && 
        item.translations[currentLanguage].options[optionIndex]) {
      return item.translations[currentLanguage].options[optionIndex];
    }
    
    // Fall back to original
    return originalOption;
  };

  // Simple function to get translated category description
  const getCategoryDescription = (category: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return category.cat_description || '';
    }
    
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].description) {
      return category.translations[currentLanguage].description;
    }
    
    return category.cat_description || '';
  };

  // Simple function to get translated extra text
  const getExtraText = (item: any, extraIndex: number, originalText: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalText;
    }
    
    if (item.translations && 
        item.translations[currentLanguage] && 
        item.translations[currentLanguage].extras && 
        item.translations[currentLanguage].extras[extraIndex]) {
      return item.translations[currentLanguage].extras[extraIndex];
    }
    
    return originalText;
  };  

  // Simple function to get translated addon text
  const getAddonText = (item: any, addonIndex: number, originalText: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalText;
    }
    
    if (item.translations && 
        item.translations[currentLanguage] && 
        item.translations[currentLanguage].addons && 
        item.translations[currentLanguage].addons[addonIndex]) {
      return item.translations[currentLanguage].addons[addonIndex];
    }
    
    return originalText;
  };

  // For category extras and addons (similar logic)
  const getCategoryExtraText = (category: any, extraIndex: number, originalText: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalText;
    }
    
    if (category.translations && 
        category.translations[currentLanguage] && 
        category.translations[currentLanguage].extras && 
        category.translations[currentLanguage].extras[extraIndex]) {
      return category.translations[currentLanguage].extras[extraIndex];
    }
    
    return originalText;
  };

  const getCategoryAddonText = (category: any, addonIndex: number, originalText: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalText;
    }
    
    if (category.translations && 
        category.translations[currentLanguage] && 
        category.translations[currentLanguage].addons && 
        category.translations[currentLanguage].addons[addonIndex]) {
      return category.translations[currentLanguage].addons[addonIndex];
    }
    
    return originalText;
  };

  return {
    currentLanguage,
    t, // New UI text translation function
    getItemName,
    getItemDescription,
    getCategoryName,
    getCategoryHeader,
    getCategoryFooter,
    getCategoryDescription,
    getOptionText,
    getExtraText,
    getAddonText,
    getCategoryExtraText,
    getCategoryAddonText
  };
};