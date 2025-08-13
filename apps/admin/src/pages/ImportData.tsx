// src/pages/ImportData.tsx
import React, { useState } from 'react';
import importService from '../services/importService';

interface ImportResult {
  collectionName: string;
  success: boolean;
  count?: number;
  error?: string;
}

interface TranslationImportResult {
  languageCode: string;
  success: boolean;
  imported?: number;
  skipped?: number;
  errors?: string[];
}

const ImportData: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File}>({});
  const [selectedTranslationFiles, setSelectedTranslationFiles] = useState<{[key: string]: File}>({});
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [translationImportResults, setTranslationImportResults] = useState<TranslationImportResult[]>([]);
  const [isImporting, setIsImporting] = useState<{[key: string]: boolean}>({});
  const [previewData, setPreviewData] = useState<{[key: string]: any[]}>({});
  const [translationPreviewData, setTranslationPreviewData] = useState<{[key: string]: any[]}>({});

  // Available collections to import
  const collections = [
    { name: 'categories', label: 'Categories', description: 'Menu categories and sections' },
    { name: 'menu_items', label: 'Menu Items', description: 'Individual menu items with prices and details' },
    { name: 'menus', label: 'Menus', description: 'Menu configurations and layouts' }
  ];

  const handleFileSelect = async (collectionName: string, file: File | null) => {
    if (!file) {
      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[collectionName];
        return updated;
      });
      setPreviewData(prev => {
        const updated = { ...prev };
        delete updated[collectionName];
        return updated;
      });
      return;
    }

    try {
      // Parse and preview the file
      const documents = await importService.parseJSONFile(file);
      
      setSelectedFiles(prev => ({ ...prev, [collectionName]: file }));
      setPreviewData(prev => ({ ...prev, [collectionName]: documents.slice(0, 3) })); // Preview first 3 items
      
    } catch (error) {
      alert(`Error reading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTranslationFileSelect = async (file: File | null) => {
    if (!file) return;

    // Check if it's a translation file
    const detection = importService.isTranslationFile(file.name);
    if (!detection.isTranslation || !detection.languageCode) {
      alert('File must be named in format: translations_[language].json (e.g., translations_de.json)');
      return;
    }

    try {
      // Parse and preview the file
      const documents = await importService.parseJSONFile(file);
      
      setSelectedTranslationFiles(prev => ({ ...prev, [detection.languageCode!]: file }));
      setTranslationPreviewData(prev => ({ ...prev, [detection.languageCode!]: documents.slice(0, 3) }));
      
    } catch (error) {
      alert(`Error reading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async (collectionName: string) => {
    const file = selectedFiles[collectionName];
    if (!file) return;

    setIsImporting(prev => ({ ...prev, [collectionName]: true }));

    try {
      // Parse the file
      const documents = await importService.parseJSONFile(file);
      
      // Validate documents
      const validation = importService.validateDocuments(collectionName, documents);
      if (!validation.valid) {
        throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
      }

      // Import to Firestore
      const count = await importService.importToCollection(collectionName, documents);
      
      // Record success
      setImportResults(prev => [
        ...prev.filter(r => r.collectionName !== collectionName),
        { collectionName, success: true, count }
      ]);

    } catch (error) {
      // Record error
      setImportResults(prev => [
        ...prev.filter(r => r.collectionName !== collectionName),
        { 
          collectionName, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      ]);
    } finally {
      setIsImporting(prev => ({ ...prev, [collectionName]: false }));
    }
  };

  const handleTranslationImport = async (languageCode: string) => {
    const file = selectedTranslationFiles[languageCode];
    if (!file) return;

    const importKey = `translation_${languageCode}`;
    setIsImporting(prev => ({ ...prev, [importKey]: true }));

    try {
      // Parse the file
      const documents = await importService.parseJSONFile(file);
      
      // Validate translation documents
      const validation = importService.validateTranslationDocuments(documents);
      if (!validation.valid) {
        throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
      }

      // Import translations to subcollections
      const result = await importService.importTranslationsToSubcollection(languageCode, documents);
      
      // Record result
      setTranslationImportResults(prev => [
        ...prev.filter(r => r.languageCode !== languageCode),
        { 
          languageCode, 
          success: result.success, 
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors 
        }
      ]);

    } catch (error) {
      // Record error
      setTranslationImportResults(prev => [
        ...prev.filter(r => r.languageCode !== languageCode),
        { 
          languageCode, 
          success: false, 
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      ]);
    } finally {
      setIsImporting(prev => ({ ...prev, [importKey]: false }));
    }
  };

  const handleImportAll = async () => {
    // Import regular collections first
    for (const collection of collections) {
      if (selectedFiles[collection.name]) {
        await handleImport(collection.name);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Then import translations
    for (const languageCode of Object.keys(selectedTranslationFiles)) {
      await handleTranslationImport(languageCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleImportAllTranslations = async () => {
    for (const languageCode of Object.keys(selectedTranslationFiles)) {
      await handleTranslationImport(languageCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getResultForCollection = (collectionName: string) => {
    return importResults.find(r => r.collectionName === collectionName);
  };

  const getTranslationResult = (languageCode: string) => {
    return translationImportResults.find(r => r.languageCode === languageCode);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">📥 Database Import Tool</h1>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <h3 className="font-bold text-green-800">Import to sebastians-cafe</h3>
          <p className="text-green-700">
            Import JSON files exported from restaurant-menu into the new sebastians-cafe project.
          </p>
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Note:</strong> Categories are ignored during import and must be assigned in the admin app. 
              All imported menu items will have empty categories.
            </p>
          </div>
        </div>

        {/* Import All Button */}
        <div className="mb-6">
          <button
            onClick={handleImportAll}
            disabled={
              (Object.keys(selectedFiles).length === 0 && Object.keys(selectedTranslationFiles).length === 0) || 
              Object.values(isImporting).some(status => status)
            }
            className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
              (Object.keys(selectedFiles).length === 0 && Object.keys(selectedTranslationFiles).length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            🚀 Import All Selected Files
          </button>
          
          {Object.keys(selectedTranslationFiles).length > 0 && (
            <button
              onClick={handleImportAllTranslations}
              disabled={Object.values(isImporting).some(status => status)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
            >
              🌐 Import All Translations
            </button>
          )}
        </div>

        {/* Regular Collections Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold">Regular Collections</h2>
          
          {collections.map((collection) => {
            const file = selectedFiles[collection.name];
            const preview = previewData[collection.name];
            const result = getResultForCollection(collection.name);
            const importing = isImporting[collection.name];

            return (
              <div key={collection.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{collection.label}</h3>
                    <p className="text-sm text-gray-600">{collection.description}</p>
                  </div>
                  
                  <button
                    onClick={() => handleImport(collection.name)}
                    disabled={!file || importing}
                    className={`px-4 py-2 rounded font-medium ${
                      !file || importing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {importing ? '⏳ Importing...' : '📥 Import'}
                  </button>
                </div>

                {/* File Selection */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileSelect(collection.name, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {/* File Preview */}
                {preview && (
                  <div className="mb-4 bg-gray-50 rounded p-3">
                    <h4 className="font-medium mb-2">Preview ({preview.length} of {previewData[collection.name]?.length || 0} documents):</h4>
                    <div className="text-sm space-y-1">
                      {preview.map((doc, index) => (
                        <div key={index} className="font-mono text-xs bg-white p-2 rounded">
                          {JSON.stringify(doc, null, 2).substring(0, 200)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Result */}
                {result && (
                  <div className={`p-3 rounded ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? (
                      <span>✅ Successfully imported {result.count} documents</span>
                    ) : (
                      <span>❌ Import failed: {result.error}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Translation Collections Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold">Translation Collections</h2>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
            <h3 className="font-bold text-purple-800">Translation Files</h3>
            <p className="text-purple-700">
              Import translation files (translations_de.json, translations_es.json, etc.) to menu item subcollections.
            </p>
          </div>

          {/* Translation File Selection */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Select Translation Files</h3>
            <div className="mb-4">
              <input
                type="file"
                accept=".json"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleTranslationFileSelect(file));
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-sm text-gray-600 mt-2">
                Files must be named: translations_[language].json (e.g., translations_de.json)
              </p>
            </div>
          </div>

          {/* Selected Translation Files */}
          {Object.keys(selectedTranslationFiles).length > 0 && (
            <div className="space-y-4">
              {Object.entries(selectedTranslationFiles).map(([languageCode, file]) => {
                const preview = translationPreviewData[languageCode];
                const result = getTranslationResult(languageCode);
                const importing = isImporting[`translation_${languageCode}`];

                return (
                  <div key={languageCode} className="border rounded-lg p-4 bg-indigo-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-800">
                          {getLanguageDisplayName(languageCode)}
                        </h3>
                        <p className="text-sm text-indigo-600">File: {file.name}</p>
                        <p className="text-sm text-indigo-600">
                          Import to: menu_items/*/translations/{languageCode}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleTranslationImport(languageCode)}
                        disabled={importing}
                        className={`px-4 py-2 rounded font-medium ${
                          importing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        {importing ? '⏳ Importing...' : `🌍 Import ${languageCode.toUpperCase()}`}
                      </button>
                    </div>

                    {/* Translation Preview */}
                    {preview && (
                      <div className="mb-4 bg-white rounded p-3">
                        <h4 className="font-medium mb-2">Preview ({preview.length} of {translationPreviewData[languageCode]?.length || 0} translations):</h4>
                        <div className="text-sm space-y-1">
                          {preview.map((doc, index) => (
                            <div key={index} className="font-mono text-xs bg-gray-50 p-2 rounded">
                              Parent: {doc.parentMenuItemId} | {JSON.stringify(doc, null, 2).substring(0, 150)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Translation Import Result */}
                    {result && (
                      <div className={`p-3 rounded ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? (
                          <div>
                            <span>✅ Translation import completed:</span>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              <li>Imported: {result.imported} translations</li>
                              {result.skipped && result.skipped > 0 && (
                                <li>Skipped: {result.skipped} translations</li>
                              )}
                            </ul>
                            {result.errors && result.errors.length > 0 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-yellow-700">View errors ({result.errors.length})</summary>
                                <ul className="list-disc list-inside mt-1 text-xs text-yellow-600">
                                  {result.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span>❌ Translation import failed</span>
                            {result.errors && result.errors.length > 0 && (
                              <ul className="list-disc list-inside mt-1 text-sm">
                                {result.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4">
          <h3 className="font-bold text-blue-800">Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Select JSON files exported from the old project</li>
            <li>For translations: Select multiple translation files (translations_de.json, translations_es.json, etc.)</li>
            <li>Review the preview to ensure data looks correct</li>
            <li>Import regular collections first, then translations (or use "Import All")</li>
            <li>Translation imports will validate that parent menu items exist</li>
            <li>Failed translations will be skipped and reported</li>
            <li>Categories are ignored during import - assign categories using the admin app after import</li>
            <li>All imported menu items will have empty categories and need to be organized manually</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ImportData;