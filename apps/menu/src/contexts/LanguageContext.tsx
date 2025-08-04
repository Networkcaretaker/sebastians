// apps/menu/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
const DEBUG = false;

// Language configuration based on your JSON structure
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  //{ code: 'fr', name: 'French', flag: '🇫🇷' },
  //{ code: 'it', name: 'Italian', flag: '🇮🇹' },
  //{ code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  //{ code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
];

export const DEFAULT_LANGUAGE = 'en';

// Context interface
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  availableLanguages: typeof SUPPORTED_LANGUAGES;
  defaultLanguage: string;
  getLanguageName: (code: string) => string;
  getLanguageFlag: (code: string) => string;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Context provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Context provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('menu-language');
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Function to change language
  const setLanguage = (languageCode: string) => {
    // Validate language code
    if (!SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      console.warn(`Language code "${languageCode}" is not supported. Falling back to ${DEFAULT_LANGUAGE}`);
      languageCode = DEFAULT_LANGUAGE;
    }

    setCurrentLanguage(languageCode);
    
    // Persist language choice
    localStorage.setItem('menu-language', languageCode);
    
    // Optional: Log language change for debugging
    if (DEBUG) {
      console.log(`Language changed to: ${languageCode}`);
    };
  };

  // Helper function to get language name
  const getLanguageName = (code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : 'English';
  };

  // Helper function to get language flag
  const getLanguageFlag = (code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.flag : '🇬🇧';
  };

  // Context value
  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    defaultLanguage: DEFAULT_LANGUAGE,
    getLanguageName,
    getLanguageFlag
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// Export context for advanced usage
export { LanguageContext };