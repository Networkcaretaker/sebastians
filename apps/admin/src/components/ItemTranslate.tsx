// Replace: apps/admin/src/components/ItemTranslate.tsx

import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  MenuItemTranslation, 
  CreateTranslationDTO,
  Language
} from '../types/menu.types';
import { translationService } from '../services/translationService';

// Define supported languages directly in the component
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
];

interface ItemTranslateProps {
  item: MenuItem;
  onTranslationUpdated?: () => void;
}

const ItemTranslate: React.FC<ItemTranslateProps> = ({ item, onTranslationUpdated }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [translations, setTranslations] = useState<Record<string, MenuItemTranslation>>({});
  const [currentTranslation, setCurrentTranslation] = useState<CreateTranslationDTO>({
    item_name: '',
    item_description: '',
    translated_options: [],
    translated_extras: [],
    translated_addons: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all translations for this item
  useEffect(() => {
    loadTranslations();
  }, [item.id]);

  // Update current translation when language selection changes
  useEffect(() => {
    if (translations[selectedLanguage]) {
      const translation = translations[selectedLanguage];
      setCurrentTranslation({
        item_name: translation.item_name,
        item_description: translation.item_description,
        translated_options: translation.translated_options || [],
        translated_extras: translation.translated_extras || [],
        translated_addons: translation.translated_addons || []
      });
    } else {
      // Reset form for new translation with empty arrays matching original item lengths
      setCurrentTranslation({
        item_name: '',
        item_description: '',
        translated_options: item.options ? new Array(item.options.length).fill('') : [],
        translated_extras: item.extras ? new Array(item.extras.length).fill('') : [],
        translated_addons: item.addons ? new Array(item.addons.length).fill('') : []
      });
    }
  }, [selectedLanguage, translations, item]);

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
      setMessage({ type: 'error', text: 'Failed to load translations' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!item.id || !selectedLanguage) return;

    // Check if there's any content to save
    const hasBasicContent = currentTranslation.item_name.trim() || currentTranslation.item_description.trim();
    const hasOptionsContent = currentTranslation.translated_options?.some(opt => opt.trim());
    const hasExtrasContent = currentTranslation.translated_extras?.some(ext => ext.trim());
    const hasAddonsContent = currentTranslation.translated_addons?.some(addon => addon.trim());

    if (!hasBasicContent && !hasOptionsContent && !hasExtrasContent && !hasAddonsContent) {
      setMessage({ type: 'error', text: 'Please enter at least some translation content' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await translationService.saveTranslation(
        item.id,
        selectedLanguage,
        currentTranslation
      );

      if (response.success) {
        setMessage({ type: 'success', text: 'Translation saved successfully!' });
        await loadTranslations();
        if (onTranslationUpdated) {
          onTranslationUpdated();
        }
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      setMessage({ type: 'error', text: 'Failed to save translation' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTranslation = async () => {
    if (!item.id || !selectedLanguage || !translations[selectedLanguage]) return;

    if (!confirm('Are you sure you want to delete this translation?')) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await translationService.deleteTranslation(item.id, selectedLanguage);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Translation deleted successfully!' });
        await loadTranslations();
        if (onTranslationUpdated) {
          onTranslationUpdated();
        }
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      setMessage({ type: 'error', text: 'Failed to delete translation' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateBasicTranslation = (field: 'item_name' | 'item_description', value: string) => {
    setCurrentTranslation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateOptionTranslation = (index: number, value: string) => {
    setCurrentTranslation(prev => ({
      ...prev,
      translated_options: prev.translated_options?.map((option, i) => 
        i === index ? value : option
      ) || []
    }));
  };

  const updateExtraTranslation = (index: number, value: string) => {
    setCurrentTranslation(prev => ({
      ...prev,
      translated_extras: prev.translated_extras?.map((extra, i) => 
        i === index ? value : extra
      ) || []
    }));
  };

  const updateAddonTranslation = (index: number, value: string) => {
    setCurrentTranslation(prev => ({
      ...prev,
      translated_addons: prev.translated_addons?.map((addon, i) => 
        i === index ? value : addon
      ) || []
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading translations...</div>
      </div>
    );
  }

  const selectedLanguageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
  const hasExistingTranslation = !!translations[selectedLanguage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 columns-2">
        <h3 className="text-lg font-semibold text-gray-900">Item Translations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Translate "{item.item_name}" into different languages
        </p>
        <div className="flex items-center justify-end space-x-4">
          <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
            Select Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end space-x-2 py-1">
          {hasExistingTranslation ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600">
                ✅Translated
              </span>
              <button
                onClick={handleDeleteTranslation}
                disabled={isSaving}
                className="text-xs text-red-500 hover:text-red-800 disabled:opacity-50"
              >
                ⛔Delete Translation
              </button>
            </>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light text-gray-800">
              <i>Not Translated</i>
            </span>
          )}
        </div>
      </div>

      {/* Basic Translation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Content (Left Side) */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Original (English)</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
              {item.item_name || 'No name provided'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 min-h-[100px]">
              {item.item_description || 'No description provided'}
            </div>
          </div>
        </div>

        {/* Translation Content (Right Side) */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">
            Translation ({selectedLanguageInfo?.flag} {selectedLanguageInfo?.name})
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Translated Name</label>
            <input
              type="text"
              value={currentTranslation.item_name}
              onChange={(e) => updateBasicTranslation('item_name', e.target.value)}
              placeholder={`Translate "${item.item_name}" to ${selectedLanguageInfo?.name}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Translated Description</label>
            <textarea
              value={currentTranslation.item_description}
              onChange={(e) => updateBasicTranslation('item_description', e.target.value)}
              placeholder={`Translate the description to ${selectedLanguageInfo?.name}`}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Options Translation */}
      {item.options && item.options.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Options Translation</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Original Options</h5>
              {item.options.map((option, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-300 bg-gray-50 rounded text-sm">
                  {option.option} - €{option.price}
                </div>
              ))}
            </div>

            {/* Translated Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Translated Options</h5>
              {item.options.map((option, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={currentTranslation.translated_options?.[index] || ''}
                    onChange={(e) => updateOptionTranslation(index, e.target.value)}
                    placeholder={`Translate "${option.option}"`}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extras Translation */}
      {item.extras && item.extras.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Extras Translation</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Extras */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Original Extras</h5>
              {item.extras.map((extra, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-300 bg-gray-50 rounded text-sm">
                  {extra.item} - €{extra.price}
                </div>
              ))}
            </div>

            {/* Translated Extras */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Translated Extras</h5>
              {item.extras.map((extra, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={currentTranslation.translated_extras?.[index] || ''}
                    onChange={(e) => updateExtraTranslation(index, e.target.value)}
                    placeholder={`Translate "${extra.item}"`}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Addons Translation */}
      {item.addons && item.addons.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Addons Translation</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Addons */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Original Addons</h5>
              {item.addons.map((addon, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-300 bg-gray-50 rounded text-sm">
                  {addon.item}
                </div>
              ))}
            </div>

            {/* Translated Addons */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Translated Addons</h5>
              {item.addons.map((addon, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={currentTranslation.translated_addons?.[index] || ''}
                    onChange={(e) => updateAddonTranslation(index, e.target.value)}
                    placeholder={`Translate "${addon.item}"`}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSaveTranslation}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Translation'}
        </button>
      </div>

      {/* Translation Summary */}
      {Object.keys(translations).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Existing Translations</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(translations).map((langCode) => {
              const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
              const translation = translations[langCode];
              
              return (
                <div
                  key={langCode}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedLanguage === langCode
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLanguage(langCode)}
                >
                  <div className="text-sm font-medium">
                    {language?.flag} {language?.name || langCode}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {translation.item_name || 'Untitled'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemTranslate;