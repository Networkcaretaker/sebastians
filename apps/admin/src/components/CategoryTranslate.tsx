// apps/admin/src/components/CategoryTranslate.tsx

import React, { useState, useEffect } from 'react';
import { 
  MenuCategory, 
  CategoryTranslation, 
  CreateCategoryTranslationDTO,
  Language
} from '../types/menu.types';
import { categoryTranslationService } from '../services/categoryTranslationService';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import app, { auth } from '../config/firebase';

// Define supported languages directly in the component
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
];

interface CategoryTranslateProps {
  category: MenuCategory;
  onTranslationUpdated?: () => void;
}

const CategoryTranslate: React.FC<CategoryTranslateProps> = ({ category, onTranslationUpdated }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [translations, setTranslations] = useState<Record<string, CategoryTranslation>>({});
  const [currentTranslation, setCurrentTranslation] = useState<CreateCategoryTranslationDTO>({
    cat_name: '',
    cat_description: '',
    header: '',
    footer: '',
    translated_extras: [],
    translated_addons: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);

  // Check which fields have content
  const hasDescription = category.cat_description && category.cat_description.trim().length > 0;
  const hasHeader = category.header && category.header.trim().length > 0;
  const hasFooter = category.footer && category.footer.trim().length > 0;
  const hasExtras = category.extras && category.extras.length > 0;
  const hasAddons = category.addons && category.addons.length > 0;

  // Load all translations for this category
  useEffect(() => {
    loadTranslations();
  }, [category.id]);

  // Update current translation when language selection changes
  useEffect(() => {
    if (translations[selectedLanguage]) {
      const translation = translations[selectedLanguage];
      setCurrentTranslation({
        cat_name: translation.cat_name,
        cat_description: translation.cat_description,
        header: translation.header,
        footer: translation.footer,
        translated_extras: translation.translated_extras || [],
        translated_addons: translation.translated_addons || []
      });
    } else {
      // Reset form for new translation with empty arrays matching original category lengths
      setCurrentTranslation({
        cat_name: '',
        cat_description: '',
        header: '',
        footer: '',
        translated_extras: category.extras ? new Array(category.extras.length).fill('') : [],
        translated_addons: category.addons ? new Array(category.addons.length).fill('') : []
      });
    }
  }, [selectedLanguage, translations, category]);

  const loadTranslations = async () => {
    if (!category.id) return;
    
    setIsLoading(true);
    try {
      const response = await categoryTranslationService.getCategoryTranslations(category.id);
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
    if (!category.id || !selectedLanguage) return;

    // Check if there's any content to save
    const hasBasicContent = currentTranslation.cat_name.trim() || 
                          currentTranslation.cat_description.trim() ||
                          currentTranslation.header.trim() ||
                          currentTranslation.footer.trim();
    const hasExtrasContent = currentTranslation.translated_extras?.some(ext => ext.trim());
    const hasAddonsContent = currentTranslation.translated_addons?.some(addon => addon.trim());

    if (!hasBasicContent && !hasExtrasContent && !hasAddonsContent) {
      setMessage({ type: 'error', text: 'Please enter at least some translation content' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await categoryTranslationService.saveCategoryTranslation(
        category.id,
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
    if (!category.id || !selectedLanguage || !translations[selectedLanguage]) return;

    if (!confirm('Are you sure you want to delete this translation?')) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await categoryTranslationService.deleteCategoryTranslation(category.id, selectedLanguage);
      
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

  const handleAutoTranslate = async () => {
    if (!category.id || !selectedLanguage) return;

    setIsAutoTranslating(true);
    setMessage(null);

    try {
      // Initialize Firebase Functions with auth
      const functions = getFunctions(app);

      // Connect to emulator in development
      if (process.env.NODE_ENV === 'development') {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      
      // Make sure we're authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to use auto-translate');
      }

      // Get fresh auth token
      const idToken = await currentUser.getIdToken(true);
      console.log('Using auth token:', idToken.substring(0, 20) + '...');

      const autoTranslateFunction = httpsCallable(functions, 'autoTranslateCategory');

      console.log(`Calling auto-translate for category ${category.id} to ${selectedLanguage}`);

      // Call the cloud function
      const result = await autoTranslateFunction({ 
        categoryId: category.id, 
        targetLanguage: selectedLanguage 
      });

      console.log('Auto-translate result:', result);

      // Type the result data properly
      const responseData = result.data as any;

      if (responseData?.success) {
        const translatedData = responseData.translation;
        
        // Update the form with translated content
        setCurrentTranslation({
          cat_name: translatedData?.cat_name || '',
          cat_description: translatedData?.cat_description || '',
          header: translatedData?.header || '',
          footer: translatedData?.footer || '',
          translated_extras: translatedData?.translated_extras || [],
          translated_addons: translatedData?.translated_addons || []
        });

        setMessage({ 
          type: 'success', 
          text: `Auto-translation completed! You can now review and save the translation.`
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: responseData?.message || 'Auto-translation failed' 
        });
      }

    } catch (error: any) {
      console.error('Auto-translate error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to auto-translate. Please try again.' 
      });
    } finally {
      setIsAutoTranslating(false);
    }
  };

  const updateBasicTranslation = (field: 'cat_name' | 'cat_description' | 'header' | 'footer', value: string) => {
    setCurrentTranslation(prev => ({
      ...prev,
      [field]: value
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
    <div className="bg-white rounded-lg shadow-md p-4 mb-8 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 columns-1 md:columns-2">
        <h3 className="text-lg font-semibold text-gray-900">Category Translations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Translate "{category.cat_name}" into different languages
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
              {category.cat_name || 'No name provided'}
            </div>
          </div>

          {hasDescription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 min-h-[60px]">
                {category.cat_description}
              </div>
            </div>
          )}

          {hasHeader && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {category.header}
              </div>
            </div>
          )}

          {hasFooter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {category.footer}
              </div>
            </div>
          )}
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
              value={currentTranslation.cat_name}
              onChange={(e) => updateBasicTranslation('cat_name', e.target.value)}
              placeholder={`Translate "${category.cat_name}" to ${selectedLanguageInfo?.name}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {hasDescription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Translated Description</label>
              <textarea
                value={currentTranslation.cat_description}
                onChange={(e) => updateBasicTranslation('cat_description', e.target.value)}
                placeholder={`Translate the description to ${selectedLanguageInfo?.name}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {hasHeader && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Translated Header</label>
              <input
                type="text"
                value={currentTranslation.header}
                onChange={(e) => updateBasicTranslation('header', e.target.value)}
                placeholder={`Translate the header to ${selectedLanguageInfo?.name}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {hasFooter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Translated Footer</label>
              <input
                type="text"
                value={currentTranslation.footer}
                onChange={(e) => updateBasicTranslation('footer', e.target.value)}
                placeholder={`Translate the footer to ${selectedLanguageInfo?.name}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Extras Translation */}
      {hasExtras && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Extras Translation</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Extras */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Original Extras</h5>
              {category.extras.map((extra, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-300 bg-gray-50 rounded text-sm">
                  {extra.item} - €{extra.price}
                </div>
              ))}
            </div>

            {/* Translated Extras */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Translated Extras</h5>
              {category.extras.map((extra, index) => (
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
      {hasAddons && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add-ons Translation</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Addons */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Original Add-ons</h5>
              {category.addons.map((addon, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-300 bg-gray-50 rounded text-sm">
                  {addon.item}
                </div>
              ))}
            </div>

            {/* Translated Addons */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Translated Add-ons</h5>
              {category.addons.map((addon, index) => (
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
        {!hasExistingTranslation ? (
          <button
            onClick={handleAutoTranslate}
            disabled={isAutoTranslating || isSaving}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAutoTranslating ? 'Auto Translating...' : 'Auto Translate'}
          </button>) : <div/>
        }

        <button
          onClick={handleSaveTranslation}
          disabled={isSaving || isAutoTranslating}
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
                    {translation.cat_name || 'Untitled'}
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

export default CategoryTranslate;