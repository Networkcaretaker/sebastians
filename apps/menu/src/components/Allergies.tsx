// apps/menu/src/components/Allergies.tsx
import React from 'react';
import { getAvailableAllergies, getAllergyIcon } from '../utils/allergyIcons';
import { useTranslation } from '../hooks/useTranslation';

const Allergies: React.FC = () => {
  const { t, getAllergyName } = useTranslation();
  
  // Get all available allergies from our icon mapping
  const availableAllergies = getAvailableAllergies();
  
  // Filter to get unique allergies (remove duplicates like 'soy'/'soya', 'dairy'/'milk')
  const uniqueAllergies = availableAllergies.filter((allergy, _index, array) => {
    // Keep the first occurrence and filter out common duplicates
    const duplicates: Record<string, string> = {
      'soy': 'soya',
      'dairy': 'milk',
      'wheat': 'gluten',
      'shellfish': 'crustaceans',
      'sulfites': 'sulphites',
      'molluscs': 'mollusc',
      'tree nuts': 'nuts',
      'seseme': 'sesame'
    };
    
    // If this allergy has a preferred version, only keep the preferred one
    const preferred = duplicates[allergy];
    if (preferred && array.includes(preferred)) {
      return false; // Skip this one, keep the preferred version
    }
    
    return true;
  });

  // Sort alphabetically based on translated names for consistent display
  const sortedAllergies = uniqueAllergies.sort((a, b) => 
    getAllergyName(a).localeCompare(getAllergyName(b))
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border p-6 mt-6">
        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('allergiesTitle')}</h2>
            <p className="text-gray-600 text-sm">
              {t('allergiesDescription')}
            </p>
        </div>

        {/* Allergy Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sortedAllergies.map((allergy) => {
            const iconUrl = getAllergyIcon(allergy);
            const translatedName = getAllergyName(allergy);
            
            if (!iconUrl) return null;

            return (
                <div 
                key={allergy}
                className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                {/* Large Icon */}
                <div className="mb-3">
                    <img 
                    src={iconUrl}
                    alt={translatedName}
                    className="w-12 h-12 mx-auto"
                    title={translatedName}
                    />
                </div>
                
                {/* Translated Allergy Name */}
                <span className="text-sm font-medium text-gray-700 capitalize">
                    {translatedName}
                </span>
                </div>
            );
            })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('allergiesFooter')}
            </p>
        </div>
        </div>
    </div>
  );
};

export default Allergies;