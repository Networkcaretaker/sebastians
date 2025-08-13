// src/services/importService.ts
import { db } from '../config/firebase';
import { collection, doc, writeBatch, getDocs, getDoc } from 'firebase/firestore';

interface TranslationImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export const importService = {
  // Parse JSON file content
  parseJSONFile: (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          
          // Validate that it's an array
          if (!Array.isArray(jsonContent)) {
            reject(new Error('JSON file must contain an array of documents'));
            return;
          }
          
          resolve(jsonContent);
        } catch (error) {
          reject(new Error('Invalid JSON file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Import documents to a collection using batch writes
  importToCollection: async (collectionName: string, documents: any[]): Promise<number> => {
    try {
      console.log(`Importing ${documents.length} documents to ${collectionName}...`);
      
      const batchSize = 500; // Firestore batch limit
      let importedCount = 0;
      
      // Process documents in batches
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocuments = documents.slice(i, i + batchSize);
        
        batchDocuments.forEach((docData) => {
          const { id, ...data } = docData;
          
          // Convert any Date strings back to Firestore Timestamps and set updatedAt
          const processedData = importService.processDataForFirestore(data);
          
          // Use provided ID or generate new one if missing
          const docRef = id 
            ? doc(collection(db, collectionName), id)
            : doc(collection(db, collectionName)); // Auto-generate ID
          
          batch.set(docRef, processedData);
        });
        
        await batch.commit();
        importedCount += batchDocuments.length;
        
        console.log(`✅ Imported batch: ${importedCount}/${documents.length}`);
      }
      
      console.log(`🎉 Successfully imported ${importedCount} documents to ${collectionName}`);
      return importedCount;
      
    } catch (error) {
      console.error(`❌ Error importing to ${collectionName}:`, error);
      throw error;
    }
  },

  // Import translations to subcollections
  importTranslationsToSubcollection: async (languageCode: string, translations: any[]): Promise<TranslationImportResult> => {
    try {
      console.log(`Importing ${translations.length} ${languageCode} translations...`);
      
      const result: TranslationImportResult = {
        success: true,
        imported: 0,
        skipped: 0,
        errors: []
      };
      
      const batchSize = 500;
      
      // Process translations in batches
      for (let i = 0; i < translations.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchTranslations = translations.slice(i, i + batchSize);
        
        for (const translationData of batchTranslations) {
          const { id, parentMenuItemId, ...data } = translationData;
          
          if (!parentMenuItemId) {
            result.errors.push(`Translation ${i + 1}: Missing parentMenuItemId`);
            result.skipped++;
            continue;
          }
          
          try {
            // Validate parent menu item exists
            const parentDocRef = doc(db, 'menu_items', parentMenuItemId);
            const parentDoc = await getDoc(parentDocRef);
            
            if (!parentDoc.exists()) {
              result.errors.push(`Translation for item ${parentMenuItemId}: Parent menu item not found`);
              result.skipped++;
              continue;
            }
            
            // Process translation data
            const processedData = importService.processTranslationDataForFirestore(data);
            
            // Use provided language ID or auto-generate if missing
            const translationId = id || languageCode;
            
            // Create translation document reference
            const translationDocRef = doc(db, 'menu_items', parentMenuItemId, 'translations', translationId);
            batch.set(translationDocRef, processedData);
            
            result.imported++;
            
          } catch (error) {
            result.errors.push(`Translation for item ${parentMenuItemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.skipped++;
          }
        }
        
        if (result.imported > 0) {
          await batch.commit();
        }
        
        console.log(`✅ Translation batch processed: ${result.imported} imported, ${result.skipped} skipped`);
      }
      
      console.log(`🎉 Translation import completed: ${result.imported} imported, ${result.skipped} skipped`);
      return result;
      
    } catch (error) {
      console.error(`❌ Error importing ${languageCode} translations:`, error);
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  // Process data to handle Firestore-specific types (always set updatedAt to current time)
  processDataForFirestore: (data: any): any => {
    const processed = { ...data };
    
    // Convert date strings back to Date objects, but ignore updatedAt from JSON
    if (processed.createdAt && typeof processed.createdAt === 'string') {
      processed.createdAt = new Date(processed.createdAt);
    }
    
    // Always set updatedAt to current time, ignoring any value from JSON
    processed.updatedAt = new Date();
    
    // Ensure consistent structure for menu items with default values
    if (processed.item_name) { // This indicates it's a menu item
      // Always set category to empty string - categories must be assigned in admin app
      processed.category = '';
      
      // Set default values for missing fields to ensure consistent structure
      processed.item_description = processed.item_description || '';
      processed.menu_order = processed.menu_order || 0;
      processed.allergies = processed.allergies || [];
      processed.options = processed.options || [];
      processed.extras = processed.extras || [];
      processed.addons = processed.addons || [];
      
      // Ensure flags object exists with all required boolean fields
      processed.flags = {
        active: processed.flags?.active !== undefined ? processed.flags.active : true,
        vegetarian: processed.flags?.vegetarian || false,
        vegan: processed.flags?.vegan || false,
        spicy: processed.flags?.spicy || false,
        options: processed.flags?.options !== undefined ? processed.flags.options : (processed.options?.length > 0),
        extras: processed.flags?.extras !== undefined ? processed.flags.extras : (processed.extras?.length > 0),
        addons: processed.flags?.addons !== undefined ? processed.flags.addons : (processed.addons?.length > 0)
      };
    }
    
    return processed;
  },

  // Process translation data for Firestore (always set updatedAt to current time)
  processTranslationDataForFirestore: (data: any): any => {
    const processed = { ...data };
    
    // Convert date strings back to Date objects, but ignore updatedAt from JSON
    if (processed.createdAt && typeof processed.createdAt === 'string') {
      processed.createdAt = new Date(processed.createdAt);
    }
    
    // Always set updatedAt to current time, ignoring any value from JSON
    processed.updatedAt = new Date();
    
    return processed;
  },

  // Validate document structure for specific collections
  validateDocuments: (collectionName: string, documents: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    documents.forEach((doc, index) => {
      // ID field is optional - will be auto-generated if missing
      
      // Collection-specific validations
      switch (collectionName) {
        case 'categories':
          if (!doc.cat_name) {
            errors.push(`Document ${index + 1}: Missing 'cat_name' field`);
          }
          break;
          
        case 'menu_items':
          if (!doc.item_name) {
            errors.push(`Document ${index + 1}: Missing 'item_name' field`);
          }
          if (typeof doc.price !== 'number') {
            errors.push(`Document ${index + 1}: 'price' must be a number`);
          }
          // Category field is optional - can be assigned later in the app
          break;
          
        case 'menus':
          if (!doc.menu_name) {
            errors.push(`Document ${index + 1}: Missing 'menu_name' field`);
          }
          break;
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Validate translation documents
  validateTranslationDocuments: (translations: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    translations.forEach((translation, index) => {
      if (!translation.parentMenuItemId) {
        errors.push(`Translation ${index + 1}: Missing 'parentMenuItemId' field`);
      }
      
      // ID field is optional for translations - will use language code if missing
      
      // Check if it has at least one translation field
      const hasTranslationContent = translation.item_name || 
                                  translation.item_description || 
                                  (translation.translated_options && translation.translated_options.length > 0) ||
                                  (translation.translated_extras && translation.translated_extras.length > 0) ||
                                  (translation.translated_addons && translation.translated_addons.length > 0);
      
      if (!hasTranslationContent) {
        errors.push(`Translation ${index + 1}: No translation content found`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Detect if a filename is a translation file
  isTranslationFile: (filename: string): { isTranslation: boolean; languageCode?: string } => {
    const match = filename.match(/^translations_([a-z]{2})\.json$/i);
    return {
      isTranslation: !!match,
      languageCode: match ? match[1].toLowerCase() : undefined
    };
  },

  // Get collection info
  getCollectionInfo: async (collectionName: string) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return {
        exists: true,
        documentCount: snapshot.size
      };
    } catch (error) {
      return {
        exists: false,
        documentCount: 0
      };
    }
  }
};

export default importService;