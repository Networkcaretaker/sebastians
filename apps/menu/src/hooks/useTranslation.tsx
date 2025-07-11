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
    spicy: '🌶️ Spicy',
    
    // Allergies page UI text
    allergiesTitle: 'Allergy Information',
    allergiesDescription: 'Menu items containing these allergens are marked with the corresponding icons',
    allergiesFooter: 'Please inform your server of any allergies or dietary requirements',
    
    // Footer UI text
    thankYouMessage: 'Thank you for dining with us!',
    followFacebook: 'Follow us on Facebook',
    
    // Home page UI text
    welcomeMessage: 'Welcome to our restaurant! Browse our delicious menu offerings below.',
    loadingMenus: 'Loading menus...',
    errorLoadingMenus: 'Error Loading Menus',
    noMenusAvailable: 'No Menus Available',
    menuUpdatingMessage: "We're currently updating our menu offerings. Please check back soon for our latest delicious options!",
    ourMenus: 'Our Menus',
    viewMenu: 'View Menu'
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
    spicy: '🌶️ Picante',
    
    // Allergies page UI text
    allergiesTitle: 'Información sobre Alergias',
    allergiesDescription: 'Los elementos del menú que contienen estos alérgenos están marcados con los iconos correspondientes',
    allergiesFooter: 'Informe a su camarero sobre cualquier alergia o requisito dietético',
    
    // Footer UI text
    thankYouMessage: '¡Gracias por cenar con nosotros!',
    followFacebook: 'Síguenos en Facebook',
    
    // Home page UI text
    welcomeMessage: '¡Bienvenido a nuestro restaurante! Explore nuestras deliciosas ofertas de menú a continuación.',
    loadingMenus: 'Cargando menús...',
    errorLoadingMenus: 'Error al Cargar los Menús',
    noMenusAvailable: 'No Hay Menús Disponibles',
    menuUpdatingMessage: 'Actualmente estamos actualizando nuestras ofertas de menú. ¡Vuelve pronto para conocer nuestras últimas opciones deliciosas!',
    ourMenus: 'Nuestros Menús',
    viewMenu: 'Ver Menú'
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
    spicy: '🌶️ Scharf',
    
    // Allergies page UI text
    allergiesTitle: 'Allergie-Informationen',
    allergiesDescription: 'Menüpunkte, die diese Allergene enthalten, sind mit den entsprechenden Symbolen gekennzeichnet',
    allergiesFooter: 'Bitte informieren Sie Ihren Kellner über Allergien oder Ernährungsanforderungen',
    
    // Footer UI text
    thankYouMessage: 'Vielen Dank, dass Sie bei uns speisen!',
    followFacebook: 'Folgen Sie uns auf Facebook',
    
    // Home page UI text
    welcomeMessage: 'Willkommen in unserem Restaurant! Stöbern Sie unten in unseren köstlichen Menüangeboten.',
    loadingMenus: 'Menüs werden geladen...',
    errorLoadingMenus: 'Fehler beim Laden der Menüs',
    noMenusAvailable: 'Keine Menüs Verfügbar',
    menuUpdatingMessage: 'Wir aktualisieren derzeit unsere Menüangebote. Schauen Sie bald wieder vorbei für unsere neuesten köstlichen Optionen!',
    ourMenus: 'Unsere Menüs',
    viewMenu: 'Menü Anzeigen'
  }
  // Add more languages as needed
};

// Allergy name translations
const ALLERGY_TRANSLATIONS = {
  en: {
    'celery': 'Celery',
    'corn': 'Corn',
    'crustaceans': 'Crustaceans',
    'eggs': 'Eggs',
    'fish': 'Fish',
    'gluten': 'Gluten',
    'lupin': 'Lupin',
    'milk': 'Milk',
    'dairy': 'Dairy',
    'mollusc': 'Mollusc',
    'molluscs': 'Molluscs',
    'mustard': 'Mustard',
    'nuts': 'Nuts',
    'tree nuts': 'Tree Nuts',
    'peanuts': 'Peanuts',
    'propolis': 'Propolis',
    'sesame': 'Sesame',
    'seseme': 'Sesame',
    'soya': 'Soya',
    'soy': 'Soy',
    'sulphites': 'Sulphites',
    'sulfites': 'Sulfites',
    'wheat': 'Wheat',
    'shellfish': 'Shellfish'
  },
  es: {
    'celery': 'Apio',
    'corn': 'Maíz',
    'crustaceans': 'Crustáceos',
    'eggs': 'Huevos',
    'fish': 'Pescado',
    'gluten': 'Gluten',
    'lupin': 'Altramuz',
    'milk': 'Leche',
    'dairy': 'Lácteos',
    'mollusc': 'Molusco',
    'molluscs': 'Moluscos',
    'mustard': 'Mostaza',
    'nuts': 'Frutos Secos',
    'tree nuts': 'Frutos Secos del Árbol',
    'peanuts': 'Cacahuetes',
    'propolis': 'Propóleo',
    'sesame': 'Sésamo',
    'seseme': 'Sésamo',
    'soya': 'Soja',
    'soy': 'Soja',
    'sulphites': 'Sulfitos',
    'sulfites': 'Sulfitos',
    'wheat': 'Trigo',
    'shellfish': 'Mariscos'
  },
  de: {
    'celery': 'Sellerie',
    'corn': 'Mais',
    'crustaceans': 'Krebstiere',
    'eggs': 'Eier',
    'fish': 'Fisch',
    'gluten': 'Gluten',
    'lupin': 'Lupine',
    'milk': 'Milch',
    'dairy': 'Milchprodukte',
    'mollusc': 'Weichtier',
    'molluscs': 'Weichtiere',
    'mustard': 'Senf',
    'nuts': 'Nüsse',
    'tree nuts': 'Baumnüsse',
    'peanuts': 'Erdnüsse',
    'propolis': 'Propolis',
    'sesame': 'Sesam',
    'seseme': 'Sesam',
    'soya': 'Soja',
    'soy': 'Soja',
    'sulphites': 'Sulfite',
    'sulfites': 'Sulfite',
    'wheat': 'Weizen',
    'shellfish': 'Schalentiere'
  }
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

  // Function to get translated allergy name
  const getAllergyName = (allergyKey: string): string => {
    const normalizedKey = allergyKey.toLowerCase().trim();
    const translations = ALLERGY_TRANSLATIONS[currentLanguage as keyof typeof ALLERGY_TRANSLATIONS];
    const fallbackTranslations = ALLERGY_TRANSLATIONS[defaultLanguage as keyof typeof ALLERGY_TRANSLATIONS] || ALLERGY_TRANSLATIONS.en;
    
    return translations?.[normalizedKey as keyof typeof translations] || 
           fallbackTranslations?.[normalizedKey as keyof typeof fallbackTranslations] || 
           allergyKey; // Return original if no translation found
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
    t, // UI text translation function
    getAllergyName, // New allergy name translation function
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