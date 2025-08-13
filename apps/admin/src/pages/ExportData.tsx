// src/pages/ExportData.tsx
import React, { useState, useEffect } from 'react';
import exportService from '../services/exportService';

const ExportData: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<{[key: string]: string}>({});
  const [isExporting, setIsExporting] = useState<{[key: string]: boolean}>({});
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  // List of collections to export
  const collections = [
    { name: 'categories', label: 'Categories' },
    { name: 'menu_items', label: 'Menu Items' },
    { name: 'menus', label: 'Menus' }
  ];

  // Load available languages on mount
  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  const loadAvailableLanguages = async () => {
    setIsLoadingLanguages(true);
    try {
      const languages = await exportService.discoverTranslationLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      setExportStatus(prev => ({ 
        ...prev, 
        language_discovery: `❌ Error loading languages: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const handleExport = async (collectionName: string) => {
    setIsExporting(prev => ({ ...prev, [collectionName]: true }));
    setExportStatus(prev => ({ ...prev, [collectionName]: 'Exporting...' }));

    try {
      const count = await exportService.exportAndDownload(collectionName);
      setExportStatus(prev => ({ 
        ...prev, 
        [collectionName]: `✅ Exported ${count} documents` 
      }));
    } catch (error) {
      setExportStatus(prev => ({ 
        ...prev, 
        [collectionName]: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setIsExporting(prev => ({ ...prev, [collectionName]: false }));
    }
  };

  const handleTranslationExport = async (languageCode: string) => {
    const exportKey = `translations_${languageCode}`;
    setIsExporting(prev => ({ ...prev, [exportKey]: true }));
    setExportStatus(prev => ({ ...prev, [exportKey]: 'Exporting translations...' }));

    try {
      const count = await exportService.exportAndDownloadTranslations(languageCode);
      if (count > 0) {
        setExportStatus(prev => ({ 
          ...prev, 
          [exportKey]: `✅ Exported ${count} ${languageCode.toUpperCase()} translations` 
        }));
      } else {
        setExportStatus(prev => ({ 
          ...prev, 
          [exportKey]: `ℹ️ No ${languageCode.toUpperCase()} translations found` 
        }));
      }
    } catch (error) {
      setExportStatus(prev => ({ 
        ...prev, 
        [exportKey]: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setIsExporting(prev => ({ ...prev, [exportKey]: false }));
    }
  };

  const handleExportAllTranslations = async () => {
    const exportKey = 'all_translations';
    setIsExporting(prev => ({ ...prev, [exportKey]: true }));
    setExportStatus(prev => ({ ...prev, [exportKey]: 'Exporting all translations...' }));

    try {
      const result = await exportService.exportAllTranslations();
      if (result.count > 0) {
        setExportStatus(prev => ({ 
          ...prev, 
          [exportKey]: `✅ Exported ${result.count} translations for languages: ${result.languages.join(', ')}` 
        }));
      } else {
        setExportStatus(prev => ({ 
          ...prev, 
          [exportKey]: `ℹ️ No translations found in database` 
        }));
      }
    } catch (error) {
      setExportStatus(prev => ({ 
        ...prev, 
        [exportKey]: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setIsExporting(prev => ({ ...prev, [exportKey]: false }));
    }
  };

  const handleExportAll = async () => {
    // Export regular collections first
    for (const collection of collections) {
      await handleExport(collection.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Then export all translations if any exist
    if (availableLanguages.length > 0) {
      await handleExportAllTranslations();
    }
  };

  const getLanguageDisplayName = (languageCode: string): string => {
    const languageNames: {[key: string]: string} = {
      'de': 'German (Deutsch)',
      'es': 'Spanish (Español)',
      'fr': 'French (Français)',
      'nl': 'Dutch (Nederlands)',
      'it': 'Italian (Italiano)',
      'pt': 'Portuguese (Português)'
    };
    return languageNames[languageCode] || `${languageCode.toUpperCase()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">🔄 Database Export Tool</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-blue-800">Migration Tool</h3>
          <p className="text-blue-700">
            Export collections and translations from restaurant-menu to JSON files for import into sebastians-cafe.
          </p>
        </div>

        {/* Export All Button */}
        <div className="mb-6">
          <button
            onClick={handleExportAll}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            disabled={Object.values(isExporting).some(status => status)}
          >
            📦 Export All Collections & Translations
          </button>
        </div>

        {/* Individual Collection Exports */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Individual Collections</h2>
          
          {collections.map((collection) => (
            <div key={collection.name} className="flex items-center justify-between bg-gray-50 p-4 rounded">
              <div>
                <h3 className="font-semibold">{collection.label}</h3>
                <p className="text-sm text-gray-600">Collection: {collection.name}</p>
                {exportStatus[collection.name] && (
                  <p className="text-sm mt-1">{exportStatus[collection.name]}</p>
                )}
              </div>
              
              <button
                onClick={() => handleExport(collection.name)}
                disabled={isExporting[collection.name]}
                className={`px-4 py-2 rounded font-medium ${
                  isExporting[collection.name]
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isExporting[collection.name] ? '⏳ Exporting...' : '📥 Export'}
              </button>
            </div>
          ))}
        </div>

        {/* Translations Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Translation Collections</h2>
            <button
              onClick={loadAvailableLanguages}
              disabled={isLoadingLanguages}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {isLoadingLanguages ? '⏳ Loading...' : '🔄 Refresh Languages'}
            </button>
          </div>

          {isLoadingLanguages ? (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p>🔍 Scanning database for translation languages...</p>
            </div>
          ) : availableLanguages.length > 0 ? (
            <>
              {/* Export All Translations Button */}
              <div className="bg-purple-50 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-800">All Translations</h3>
                    <p className="text-sm text-purple-600">
                      Export all available languages: {availableLanguages.map(lang => lang.toUpperCase()).join(', ')}
                    </p>
                    {exportStatus['all_translations'] && (
                      <p className="text-sm mt-1">{exportStatus['all_translations']}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleExportAllTranslations}
                    disabled={isExporting['all_translations']}
                    className={`px-4 py-2 rounded font-medium ${
                      isExporting['all_translations']
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {isExporting['all_translations'] ? '⏳ Exporting...' : '🌐 Export All Languages'}
                  </button>
                </div>
              </div>

              {/* Individual Language Exports */}
              {availableLanguages.map((languageCode) => {
                const exportKey = `translations_${languageCode}`;
                return (
                  <div key={languageCode} className="flex items-center justify-between bg-indigo-50 p-4 rounded">
                    <div>
                      <h3 className="font-semibold text-indigo-800">
                        {getLanguageDisplayName(languageCode)}
                      </h3>
                      <p className="text-sm text-indigo-600">
                        Translation subcollection: menu_items/*/translations/{languageCode}
                      </p>
                      {exportStatus[exportKey] && (
                        <p className="text-sm mt-1">{exportStatus[exportKey]}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleTranslationExport(languageCode)}
                      disabled={isExporting[exportKey]}
                      className={`px-4 py-2 rounded font-medium ${
                        isExporting[exportKey]
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      }`}
                    >
                      {isExporting[exportKey] ? '⏳ Exporting...' : `🌍 Export ${languageCode.toUpperCase()}`}
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-bold text-yellow-800">No Translations Found</h3>
              <p className="text-yellow-700">
                No translation subcollections were found in the menu_items collection.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h3 className="font-bold text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Click individual export buttons or "Export All Collections & Translations"</li>
            <li>JSON files will download to your Downloads folder</li>
            <li>Translation files include the parent menu item ID for proper relationships</li>
            <li>Use these files to import into sebastians-cafe Firebase Console</li>
            <li>Go to Firestore Database → Import data → Upload JSON files</li>
            <li>For translations: Import each language file into menu_items/*/translations/[language]</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExportData;