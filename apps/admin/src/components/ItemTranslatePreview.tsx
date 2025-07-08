// apps/admin/src/components/ItemPreview.tsx
import React, { useState, useEffect } from 'react';
import { MenuItem, MenuItemTranslation } from '../types/menu.types';
import { translationService } from '../services/translationService';

// Define supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
];

interface ItemViewProps {
  item: MenuItem;
  showTranslationHeader?: boolean;
}

const ItemPreview: React.FC<ItemViewProps> = ({ item, showTranslationHeader = true }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, MenuItemTranslation>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load translations when component mounts
  useEffect(() => {
    loadTranslations();
  }, [item.id]);

  const loadTranslations = async () => {
    if (!item.id) return;
    
    setIsLoading(true);
    try {
      const response = await translationService.getItemTranslations(item.id);
      if (response.success && response.translations) {
        setTranslations(response.translations);
      } else {
        setTranslations({});
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      setTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  // Get available languages that have translations
  const availableLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    translations[lang.code]
  );

  // Render individual item preview
  const renderItemPreview = (
    itemData: MenuItem, 
    translation?: MenuItemTranslation, 
    isTranslated: boolean = false
  ) => {
    // Use translation data if available, otherwise use original
    const displayName = translation?.item_name || itemData.item_name;
    const displayDescription = translation?.item_description || itemData.item_description;
    const displayOptions = translation?.translated_options || itemData.options?.map(opt => opt.option) || [];
    const displayExtras = translation?.translated_extras || itemData.extras?.map(extra => extra.item) || [];
    const displayAddons = translation?.translated_addons || itemData.addons?.map(addon => addon.item) || [];

    return (
      <div>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <h3 className="text-xl font-bold">{displayName}</h3>
              <div className="flex gap-1">
                {itemData.flags.vegetarian && (
                  <div className="flex gap-1 mt-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Vegetarian
                    </span>
                  </div>
                )}
                {itemData.allergies && itemData.allergies.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {itemData.allergies.map((allergy, idx) => (
                      <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {itemData.flags.options ? (
              <div className="text-green-600 text-lg font-bold">
                <span className="text-sm font-medium">from </span>
                {itemData.price.toFixed(2)}€
              </div>
            ) : (
              <div className="text-green-600 text-lg font-bold">
                {itemData.price.toFixed(2)}€
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="mt-2">
            <p className="text-gray-600">{displayDescription || ''}</p>
          </div>

          {/* Add-ons */}
          {displayAddons.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2">
              {displayAddons.map((addon, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {addon}
                </span>
              ))}
            </div>
          )}
          
          {/* Options */}
          {itemData.options && itemData.options.length > 0 && (
            <div className="">
              {itemData.options.map((option, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-base px-4">
                    {displayOptions[idx] || option.option}
                  </span>
                  <span className="text-green-600 text-base font-medium">
                    {option.price.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Extras */}
          {itemData.extras && itemData.extras.length > 0 && (
            <div className="mt-1 space-y-1">
              <label className="text-base font-medium text-gray-700">Extras:</label>
              {itemData.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-base px-4">
                    {displayExtras[idx] || extra.item}
                  </span>
                  <span className="text-green-600 font-medium">
                    {extra.price.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading translations...</div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-300 mb-5">
      {showTranslationHeader && (
        <div>
        {/* Language Selection Dropdown */}
        {availableLanguages.length > 0 && (
          <div className="mb-2 pb-2 ">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-600 m-2">
                {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.flag} {' '}
                {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name} Translation
              </h4>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None</option>
                {availableLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Translated Item Preview */}
      {selectedLanguage && translations[selectedLanguage] && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {renderItemPreview(item, translations[selectedLanguage], true)}
        </div>
      )}
    </div>
  );
};

export default ItemPreview;