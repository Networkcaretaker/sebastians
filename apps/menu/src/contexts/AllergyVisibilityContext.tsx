// apps/menu/src/contexts/AllergyVisibilityContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AllergyVisibilityContextType {
  allergiesVisible: boolean;
  toggleAllergiesVisibility: () => void;
  setAllergiesVisibility: (visible: boolean) => void;
}

const AllergyVisibilityContext = createContext<AllergyVisibilityContextType | undefined>(undefined);

// LocalStorage key for persisting preference
const ALLERGIES_VISIBILITY_KEY = 'menu_allergies_visible';

export const AllergyVisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or default to true (visible)
  const [allergiesVisible, setAllergiesVisible] = useState<boolean>(() => {
    const stored = localStorage.getItem(ALLERGIES_VISIBILITY_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  // Persist to localStorage whenever visibility changes
  useEffect(() => {
    localStorage.setItem(ALLERGIES_VISIBILITY_KEY, allergiesVisible.toString());
  }, [allergiesVisible]);

  const toggleAllergiesVisibility = () => {
    setAllergiesVisible(prev => !prev);
  };

  const setAllergiesVisibility = (visible: boolean) => {
    setAllergiesVisible(visible);
  };

  return (
    <AllergyVisibilityContext.Provider 
      value={{ 
        allergiesVisible, 
        toggleAllergiesVisibility,
        setAllergiesVisibility 
      }}
    >
      {children}
    </AllergyVisibilityContext.Provider>
  );
};

// Custom hook to use the allergy visibility context
export const useAllergyVisibility = () => {
  const context = useContext(AllergyVisibilityContext);
  if (context === undefined) {
    throw new Error('useAllergyVisibility must be used within an AllergyVisibilityProvider');
  }
  return context;
};