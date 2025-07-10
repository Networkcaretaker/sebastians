// apps/menu/src/hooks/useTranslation.tsx
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { currentLanguage, defaultLanguage } = useLanguage();

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
    
    // Check if category has translations
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].header) {
      return category.translations[currentLanguage].header;
    }
    
    // Fall back to original
    return category.cat_header || '';
  };

  // Simple function to get translated category footer
  const getCategoryFooter = (category: any): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return category.cat_footer || '';
    }
    
    // Check if category has translations
    if (category.translations && category.translations[currentLanguage] && category.translations[currentLanguage].footer) {
      return category.translations[currentLanguage].footer;
    }
    
    // Fall back to original
    return category.cat_footer || '';
  };

  // Simple function to get translated option
  const getOptionText = (item: any, optionIndex: number, originalOption: string): string => {
    if (currentLanguage === defaultLanguage || currentLanguage === 'en') {
      return originalOption;
    }
    
    // Check if item has translated options
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