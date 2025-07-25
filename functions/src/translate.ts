import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Translate } from '@google-cloud/translate/build/src/v2';

// Supported language codes that match your frontend
const SUPPORTED_LANGUAGES = ['es', 'fr', 'de', 'it', 'pt', 'nl'];

// Simple auto-translate function that follows your exact pattern
export const autoTranslateItem = functions.https.onCall(async (data: any, context: any) => {
  const logger = functions.logger;
  
  try {
    // Check authentication using the Gen 2 structure
    const authData = data?.auth;
    if (!authData || !authData.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // Extract data from the correct location (data.data)
    const itemId = data?.data?.itemId;
    const targetLanguage = data?.data?.targetLanguage;

    if (!itemId || !targetLanguage) {
      throw new functions.https.HttpsError('invalid-argument', 'itemId and targetLanguage required');
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new functions.https.HttpsError('invalid-argument', `Unsupported language: ${targetLanguage}`);
    }

    logger.info(`Auto-translating item ${itemId} to ${targetLanguage} for user ${authData.uid}`);

    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Translate API key not configured');
    }

    const translate = new Translate({
      key: apiKey
    });

    const db = admin.firestore();
    
    // Fetch the menu item from Firestore
    const itemRef = db.collection('menu_items').doc(itemId);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Menu item ${itemId} not found`);
    }

    const item = itemDoc.data();
    if (!item) {
      throw new functions.https.HttpsError('internal', 'Failed to retrieve item data');
    }

    // Check if translation already exists
    const translationRef = itemRef.collection('translations').doc(targetLanguage);
    const existingTranslation = await translationRef.get();

    if (existingTranslation.exists) {
      const existingData = existingTranslation.data();
      logger.info(`Translation already exists for ${itemId} in ${targetLanguage}`);
      
      return {
        success: true,
        translation: {
          item_name: existingData?.item_name || '',
          item_description: existingData?.item_description || '',
          translated_options: existingData?.translated_options || [],
          translated_extras: existingData?.translated_extras || [],
          translated_addons: existingData?.translated_addons || []
        },
        message: `Translation already exists for ${targetLanguage}`
      };
    }

    // Prepare texts for translation
    const textsToTranslate: string[] = [];
    textsToTranslate.push(item.item_name || '');
    textsToTranslate.push(item.item_description || '');
    
    // Add options
    if (item.options && Array.isArray(item.options)) {
      item.options.forEach((option: any) => {
        textsToTranslate.push(option.option || '');
      });
    }
    
    // Add extras
    if (item.extras && Array.isArray(item.extras)) {
      item.extras.forEach((extra: any) => {
        textsToTranslate.push(extra.item || '');
      });
    }
    
    // Add addons
    if (item.addons && Array.isArray(item.addons)) {
      item.addons.forEach((addon: any) => {
        textsToTranslate.push(addon.item || '');
      });
    }

    // Filter out empty texts but remember positions
    const nonEmptyTexts: string[] = [];
    const originalIndices: number[] = [];
    
    textsToTranslate.forEach((text: string, index: number) => {
      if (text && text.trim()) {
        nonEmptyTexts.push(text.trim());
        originalIndices.push(index);
      }
    });

    if (nonEmptyTexts.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No translatable text found');
    }

    logger.info(`Translating ${nonEmptyTexts.length} texts from English to ${targetLanguage}`);

    // Call Google Translate API
    const [translations] = await translate.translate(nonEmptyTexts, {
      from: 'en',
      to: targetLanguage,
    });

    const translatedTexts = Array.isArray(translations) ? translations : [translations];

    // Create result array with empty strings for empty inputs
    const result = new Array(textsToTranslate.length).fill('');
    originalIndices.forEach((originalIndex: number, i: number) => {
      if (translatedTexts[i]) {
        result[originalIndex] = translatedTexts[i];
      }
    });

    // Parse results back to structured format
    let index = 0;
    const structuredTranslation = {
      item_name: result[index++] || '',
      item_description: result[index++] || '',
      translated_options: [] as string[],
      translated_extras: [] as string[],
      translated_addons: [] as string[]
    };
    
    // Parse options
    if (item.options && Array.isArray(item.options)) {
      structuredTranslation.translated_options = item.options.map(() => {
        return result[index++] || '';
      });
    }
    
    // Parse extras
    if (item.extras && Array.isArray(item.extras)) {
      structuredTranslation.translated_extras = item.extras.map(() => {
        return result[index++] || '';
      });
    }
    
    // Parse addons
    if (item.addons && Array.isArray(item.addons)) {
      structuredTranslation.translated_addons = item.addons.map(() => {
        return result[index++] || '';
      });
    }

    logger.info(`Successfully translated item ${itemId} to ${targetLanguage}`);

    return {
      success: true,
      translation: structuredTranslation,
      message: `Successfully auto-translated to ${targetLanguage}`
    };

  } catch (error: any) {
    logger.error('Auto-translate error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Auto-translation failed');
  }
});

export const autoTranslateCategory = functions.https.onCall(async (data: any, context: any) => {
  const logger = functions.logger;
  
  try {
    // Check authentication using the Gen 2 structure
    const authData = data?.auth;
    if (!authData || !authData.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // Extract data from the correct location (data.data)
    const categoryId = data?.data?.categoryId;
    const targetLanguage = data?.data?.targetLanguage;

    if (!categoryId || !targetLanguage) {
      throw new functions.https.HttpsError('invalid-argument', 'categoryId and targetLanguage required');
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new functions.https.HttpsError('invalid-argument', `Unsupported language: ${targetLanguage}`);
    }

    logger.info(`Auto-translating category ${categoryId} to ${targetLanguage} for user ${authData.uid}`);

    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Translate API key not configured');
    }

    const translate = new Translate({
      key: apiKey
    });

    const db = admin.firestore();
    
    // Fetch the category from Firestore
    const categoryRef = db.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Category ${categoryId} not found`);
    }

    const category = categoryDoc.data();
    if (!category) {
      throw new functions.https.HttpsError('internal', 'Failed to retrieve category data');
    }

    // Check if translation already exists
    const translationRef = categoryRef.collection('translations').doc(targetLanguage);
    const existingTranslation = await translationRef.get();

    if (existingTranslation.exists) {
      const existingData = existingTranslation.data();
      logger.info(`Translation already exists for ${categoryId} in ${targetLanguage}`);
      
      return {
        success: true,
        translation: {
          cat_name: existingData?.cat_name || '',
          cat_description: existingData?.cat_description || '',
          header: existingData?.header || '',
          footer: existingData?.footer || '',
          translated_extras: existingData?.translated_extras || [],
          translated_addons: existingData?.translated_addons || []
        },
        message: `Translation already exists for ${targetLanguage}`
      };
    }

    // Prepare texts for translation
    const textsToTranslate: string[] = [];
    textsToTranslate.push(category.cat_name || '');
    textsToTranslate.push(category.cat_description || '');
    textsToTranslate.push(category.header || '');
    textsToTranslate.push(category.footer || '');
    
    // Add extras (only the item text, not the price)
    if (category.extras && Array.isArray(category.extras)) {
      category.extras.forEach((extra: any) => {
        textsToTranslate.push(extra.item || '');
      });
    }
    
    // Add addons
    if (category.addons && Array.isArray(category.addons)) {
      category.addons.forEach((addon: any) => {
        textsToTranslate.push(addon.item || '');
      });
    }

    // Filter out empty texts but remember positions
    const nonEmptyTexts: string[] = [];
    const originalIndices: number[] = [];
    
    textsToTranslate.forEach((text: string, index: number) => {
      if (text && text.trim()) {
        nonEmptyTexts.push(text.trim());
        originalIndices.push(index);
      }
    });

    if (nonEmptyTexts.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No translatable text found');
    }

    logger.info(`Translating ${nonEmptyTexts.length} texts from English to ${targetLanguage}`);

    // Call Google Translate API
    const [translations] = await translate.translate(nonEmptyTexts, {
      from: 'en',
      to: targetLanguage,
    });

    const translatedTexts = Array.isArray(translations) ? translations : [translations];

    // Create result array with empty strings for empty inputs
    const result = new Array(textsToTranslate.length).fill('');
    originalIndices.forEach((originalIndex: number, i: number) => {
      if (translatedTexts[i]) {
        result[originalIndex] = translatedTexts[i];
      }
    });

    // Parse results back to structured format
    let index = 0;
    const structuredTranslation = {
      cat_name: result[index++] || '',
      cat_description: result[index++] || '',
      header: result[index++] || '',
      footer: result[index++] || '',
      translated_extras: [] as string[],
      translated_addons: [] as string[]
    };
    
    // Parse extras
    if (category.extras && Array.isArray(category.extras)) {
      structuredTranslation.translated_extras = category.extras.map(() => {
        return result[index++] || '';
      });
    }
    
    // Parse addons
    if (category.addons && Array.isArray(category.addons)) {
      structuredTranslation.translated_addons = category.addons.map(() => {
        return result[index++] || '';
      });
    }

    logger.info(`Successfully translated category ${categoryId} to ${targetLanguage}`);

    return {
      success: true,
      translation: structuredTranslation,
      message: `Successfully auto-translated to ${targetLanguage}`
    };

  } catch (error: any) {
    logger.error('Auto-translate category error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Category auto-translation failed');
  }
});

export const autoTranslateMenu = functions.https.onCall(async (data: any, context: any) => {
  const logger = functions.logger;
  
  try {
    // Check authentication using the Gen 2 structure
    const authData = data?.auth;
    if (!authData || !authData.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // Extract data from the correct location (data.data)
    const menuId = data?.data?.menuId;
    const targetLanguage = data?.data?.targetLanguage;

    if (!menuId || !targetLanguage) {
      throw new functions.https.HttpsError('invalid-argument', 'menuId and targetLanguage required');
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new functions.https.HttpsError('invalid-argument', `Unsupported language: ${targetLanguage}`);
    }

    logger.info(`Auto-translating menu ${menuId} to ${targetLanguage} for user ${authData.uid}`);

    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Translate API key not configured');
    }

    const translate = new Translate({
      key: apiKey
    });

    const db = admin.firestore();
    
    // Fetch the menu from Firestore
    const menuRef = db.collection('menus').doc(menuId);
    const menuDoc = await menuRef.get();

    if (!menuDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Menu ${menuId} not found`);
    }

    const menu = menuDoc.data();
    if (!menu) {
      throw new functions.https.HttpsError('internal', 'Failed to retrieve menu data');
    }

    // Check if translation already exists
    const translationRef = menuRef.collection('translations').doc(targetLanguage);
    const existingTranslation = await translationRef.get();

    if (existingTranslation.exists) {
      const existingData = existingTranslation.data();
      logger.info(`Translation already exists for ${menuId} in ${targetLanguage}`);
      
      return {
        success: true,
        translation: {
          menu_name: existingData?.menu_name || '',
          menu_description: existingData?.menu_description || ''
        },
        message: `Translation already exists for ${targetLanguage}`
      };
    }

    // Prepare texts for translation
    const textsToTranslate: string[] = [];
    textsToTranslate.push(menu.menu_name || '');
    textsToTranslate.push(menu.menu_description || '');

    // Filter out empty texts but remember positions
    const nonEmptyTexts: string[] = [];
    const originalIndices: number[] = [];
    
    textsToTranslate.forEach((text: string, index: number) => {
      if (text && text.trim()) {
        nonEmptyTexts.push(text.trim());
        originalIndices.push(index);
      }
    });

    if (nonEmptyTexts.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No translatable text found');
    }

    logger.info(`Translating ${nonEmptyTexts.length} texts from English to ${targetLanguage}`);

    // Call Google Translate API
    const [translations] = await translate.translate(nonEmptyTexts, {
      from: 'en',
      to: targetLanguage,
    });

    const translatedTexts = Array.isArray(translations) ? translations : [translations];

    // Create result array with empty strings for empty inputs
    const result = new Array(textsToTranslate.length).fill('');
    originalIndices.forEach((originalIndex: number, i: number) => {
      if (translatedTexts[i]) {
        result[originalIndex] = translatedTexts[i];
      }
    });

    // Parse results back to structured format
    let index = 0;
    const structuredTranslation = {
      menu_name: result[index++] || '',
      menu_description: result[index++] || ''
    };

    logger.info(`Successfully translated menu ${menuId} to ${targetLanguage}`);

    return {
      success: true,
      translation: structuredTranslation,
      message: `Successfully auto-translated to ${targetLanguage}`
    };

  } catch (error: any) {
    logger.error('Auto-translate menu error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Menu auto-translation failed');
  }
});