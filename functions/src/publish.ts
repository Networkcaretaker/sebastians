// NOTE: Chrome auto-translate can modify language codes in JSON viewed in browser
// Always verify translations using raw JSON view or VS Code

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Get Firestore instance
const db = admin.firestore();

// Supported languages - matching your frontend
const SUPPORTED_LANGUAGES = ['es', 'de', 'nl', 'fr', 'it', 'pt'];

/**
 * Helper function to fetch translations for a document
 */
async function fetchTranslations(
  collection: string, 
  documentId: string
): Promise<Record<string, any>> {
  const translations: Record<string, any> = {};
  
  try {
    // Get all translation documents from the subcollection
    const translationsRef = db.collection(collection).doc(documentId).collection('translations');
    const translationDocs = await translationsRef.get();
    
    translationDocs.forEach(doc => {
      if (SUPPORTED_LANGUAGES.includes(doc.id)) {
        translations[doc.id] = doc.data();
      }
    });
  } catch (error) {
    logger.warn(`Could not fetch translations for ${collection}/${documentId}:`, error);
  }
  
  return translations;
}

/**
 * Helper function to format category translations
 */
function formatCategoryTranslations(translations: Record<string, any>) {
  const formatted: Record<string, any> = {};
  
  Object.keys(translations).forEach(lang => {
    const trans = translations[lang];
    if (trans) {
      formatted[lang] = {
        name: trans.cat_name || undefined,
        description: trans.cat_description || undefined,
        header: trans.header || undefined,
        footer: trans.footer || undefined,
        //extras: trans.extras || undefined,
        //addons: trans.addons || undefined
      };
      
      // Remove undefined values
      Object.keys(formatted[lang]).forEach(key => {
        if (formatted[lang][key] === undefined) {
          delete formatted[lang][key];
        }
      });
      
      // If no translations exist for this language, remove it
      if (Object.keys(formatted[lang]).length === 0) {
        delete formatted[lang];
      }
    }
  });
  
  return formatted;
}

/**
 * Helper function to format item translations
 */
function formatItemTranslations(translations: Record<string, any>) {
  const formatted: Record<string, any> = {};
  
  Object.keys(translations).forEach(lang => {
    const trans = translations[lang];
    if (trans) {
      formatted[lang] = {
        name: trans.item_name || undefined,
        description: trans.item_description || undefined,
        options: trans.translated_options && trans.translated_options.length > 0 
          ? trans.translated_options : undefined,
        extras: trans.translated_extras && trans.translated_extras.length > 0 
          ? trans.translated_extras : undefined,
        addons: trans.translated_addons && trans.translated_addons.length > 0 
          ? trans.translated_addons : undefined
      };
      
      // Remove undefined values
      Object.keys(formatted[lang]).forEach(key => {
        if (formatted[lang][key] === undefined) {
          delete formatted[lang][key];
        }
      });
      
      // If no translations exist for this language, remove it
      if (Object.keys(formatted[lang]).length === 0) {
        delete formatted[lang];
      }
    }
  });
  
  return formatted;
}

/**
 * Export Menu Function with Translations
 * Takes a menuId and returns complete menu data as JSON including all translations
 */
export const exportMenuJson = onCall(async (request: any) => {
  // Initialize variables with default values
  let menuId: string = '';
  let action: string = '';
  
  try {
    // Safely destructure the request data
    const data = request.data || {};
    menuId = data.menuId;
    action = data.action;
    
    if (!menuId) {
      throw new Error("Menu ID is required");
    }

    if (!action || !['publish', 'unpublish'].includes(action)) {
      throw new Error("Action must be 'publish' or 'unpublish'");
    }

    logger.info(`${action} menu with translations: ${menuId}`);

    if (action === 'unpublish') {
      // Handle unpublish - remove JSON file from storage
      const bucket = admin.storage().bucket();
      const fileName = `menus/menu-${menuId}.json`;
      const file = bucket.file(fileName);
      
      try {
        // Check if file exists before trying to delete
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          logger.info(`Deleted menu file: ${fileName}`);
        } else {
          logger.info(`Menu file not found (already deleted?): ${fileName}`);
        }
      } catch (deleteError) {
        logger.warn(`Could not delete menu file ${fileName}:`, deleteError);
        // Don't throw error - unpublish should succeed even if file doesn't exist
      }

      return {
        success: true,
        message: `Menu unpublished successfully`,
        action: 'unpublish',
        menuId
      };
    }

    // If we get here, action is 'publish'
    logger.info(`Exporting menu with translations: ${menuId}`);

    // Get the menu
    const menuDoc = await db.collection('menus').doc(menuId).get();
    if (!menuDoc.exists) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    const menuData: any = menuDoc.data();
    
    // Track all languages found in translations
    const availableLanguages = new Set<string>(['en']); // Always include English as default
    
    // Get categories with translations
    const categoryPromises = menuData.categories.map((categoryId: string) => 
      db.collection('categories').doc(categoryId).get()
    );
    const categoryDocs = await Promise.all(categoryPromises);
    
    // Get menu items and translations for each category
    const categories = [];
    for (const categoryDoc of categoryDocs) {
      if (categoryDoc.exists) {
        const categoryData: any = categoryDoc.data();
        const categoryId = categoryDoc.id;
        
        // Fetch category translations
        const categoryTranslations = await fetchTranslations('categories', categoryId);
        const formattedCategoryTranslations = formatCategoryTranslations(categoryTranslations);
        
        // Add found languages to our set
        Object.keys(formattedCategoryTranslations).forEach(lang => availableLanguages.add(lang));
        
        // Get items for this category
        const items = [];
        if (categoryData.items && categoryData.items.length > 0) {
          const itemPromises = categoryData.items.map((itemId: string) => 
            db.collection('menu_items').doc(itemId).get()
          );
          const itemDocs = await Promise.all(itemPromises);
          
          for (const itemDoc of itemDocs) {
            if (itemDoc.exists) {
              const itemData = itemDoc.data();
              const itemId = itemDoc.id;
              
              // Fetch item translations
              const itemTranslations = await fetchTranslations('menu_items', itemId);
              const formattedItemTranslations = formatItemTranslations(itemTranslations);
              
              // Add found languages to our set
              Object.keys(formattedItemTranslations).forEach(lang => availableLanguages.add(lang));
              
              // Build item object
              const item: any = {
                id: itemId,
                ...itemData
              };
              
              // Add translations if they exist
              if (Object.keys(formattedItemTranslations).length > 0) {
                item.translations = formattedItemTranslations;
              }
              
              items.push(item);
            }
          }
          
          // Sort items by menu_order
          items.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0));
        }
        
        // Build category object
        const category: any = {
          id: categoryId,
          name: categoryData.cat_name,
          header: categoryData.header,
          description: categoryData.cat_description,
          footer: categoryData.footer,
          items: items,
          addons: categoryData.addons,
          extras: categoryData.extras
        };
        
        // Add translations if they exist
        if (Object.keys(formattedCategoryTranslations).length > 0) {
          category.translations = formattedCategoryTranslations;
        }
        
        categories.push(category);
      }
    }

    // Build the complete menu JSON with language metadata
    const completeMenu = {
      menu: {
        id: menuId,
        name: menuData.menu_name,
        description: menuData.menu_description,
        type: menuData.menu_type
      },
      languages: Array.from(availableLanguages).sort(), // Convert Set to sorted array
      defaultLanguage: 'en',
      categories: categories,
      lastUpdated: new Date().toISOString()
    };

    // Save JSON to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `menus/menu-${menuId}.json`;
    const file = bucket.file(fileName);
    
    const jsonString = JSON.stringify(completeMenu, null, 2);
    
    await file.save(jsonString, {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=300', // 5 minutes cache
      },
    });

    // Make the file publicly readable
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    logger.info(`Menu export with translations completed: ${categories.length} categories, ${availableLanguages.size} languages, saved to ${publicUrl}`);

    return {
      success: true,
      message: `Menu exported successfully with translations`,
      data: completeMenu,
      url: publicUrl,
      languages: Array.from(availableLanguages)
    };

  } catch (error: any) {
    logger.error(`Error in ${action || 'unknown action'}:`, error);
    return {
      success: false,
      message: error.message || `Operation failed`,
      action: action || 'unknown',
      menuId: menuId || 'unknown'
    };
  }
});