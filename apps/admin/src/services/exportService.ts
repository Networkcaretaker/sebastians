// src/services/exportService.ts
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const exportService = {
  // Export any collection to JSON
  exportCollection: async (collectionName: string): Promise<any[]> => {
    try {
      console.log(`Exporting ${collectionName}...`);
      
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents: any[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Exported ${documents.length} documents from ${collectionName}`);
      return documents;
      
    } catch (error) {
      console.error(`❌ Error exporting ${collectionName}:`, error);
      throw error;
    }
  },

  // Download data as JSON file
  downloadAsJSON: (data: any[], filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Combined export and download
  exportAndDownload: async (collectionName: string) => {
    try {
      const data = await exportService.exportCollection(collectionName);
      exportService.downloadAsJSON(data, collectionName);
      return data.length;
    } catch (error) {
      console.error(`Failed to export ${collectionName}:`, error);
      throw error;
    }
  },

  // Discover all available translation languages
  discoverTranslationLanguages: async (): Promise<string[]> => {
    try {
      console.log('Discovering available translation languages...');
      
      const menuItemsSnapshot = await getDocs(collection(db, 'menu_items'));
      const languagesSet = new Set<string>();
      
      for (const menuItemDoc of menuItemsSnapshot.docs) {
        try {
          const translationsSnapshot = await getDocs(
            collection(db, 'menu_items', menuItemDoc.id, 'translations')
          );
          
          translationsSnapshot.forEach((translationDoc) => {
            languagesSet.add(translationDoc.id);
          });
        } catch (error) {
          // Skip items without translations
        }
      }
      
      const languages = Array.from(languagesSet).sort();
      console.log(`✅ Found translation languages: ${languages.join(', ')}`);
      return languages;
      
    } catch (error) {
      console.error('❌ Error discovering translation languages:', error);
      throw error;
    }
  },

  // Export translations for a specific language
  exportTranslationsForLanguage: async (languageCode: string): Promise<any[]> => {
    try {
      console.log(`Exporting ${languageCode} translations...`);
      
      const menuItemsSnapshot = await getDocs(collection(db, 'menu_items'));
      const translations: any[] = [];
      
      for (const menuItemDoc of menuItemsSnapshot.docs) {
        try {
          const translationsSnapshot = await getDocs(
            collection(db, 'menu_items', menuItemDoc.id, 'translations')
          );
          
          translationsSnapshot.forEach((translationDoc) => {
            if (translationDoc.id === languageCode) {
              translations.push({
                id: translationDoc.id,
                parentMenuItemId: menuItemDoc.id,
                ...translationDoc.data()
              });
            }
          });
        } catch (error) {
          // Skip items without this language translation
        }
      }
      
      console.log(`✅ Exported ${translations.length} ${languageCode} translations`);
      return translations;
      
    } catch (error) {
      console.error(`❌ Error exporting ${languageCode} translations:`, error);
      throw error;
    }
  },

  // Export and download translations for a specific language
  exportAndDownloadTranslations: async (languageCode: string): Promise<number> => {
    try {
      const translations = await exportService.exportTranslationsForLanguage(languageCode);
      if (translations.length > 0) {
        exportService.downloadAsJSON(translations, `translations_${languageCode}`);
      }
      return translations.length;
    } catch (error) {
      console.error(`Failed to export ${languageCode} translations:`, error);
      throw error;
    }
  },

  // Export all available translation languages
  exportAllTranslations: async (): Promise<{ count: number; languages: string[] }> => {
    try {
      const languages = await exportService.discoverTranslationLanguages();
      
      if (languages.length === 0) {
        return { count: 0, languages: [] };
      }
      
      let totalCount = 0;
      const exportedLanguages: string[] = [];
      
      for (const languageCode of languages) {
        const count = await exportService.exportAndDownloadTranslations(languageCode);
        if (count > 0) {
          totalCount += count;
          exportedLanguages.push(languageCode);
        }
      }
      
      return { count: totalCount, languages: exportedLanguages };
      
    } catch (error) {
      console.error('Failed to export all translations:', error);
      throw error;
    }
  }
};

export default exportService;