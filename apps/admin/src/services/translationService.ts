// Replace: apps/admin/src/services/translationService.ts

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

import {
  MenuItemTranslation,
  CreateTranslationDTO,
  UpdateTranslationDTO,
  TranslationResponse,
  GetTranslationsResponse
} from '../types/menu.types';

const MENU_ITEMS_COLLECTION = 'menu_items';
const TRANSLATIONS_SUBCOLLECTION = 'translations';

export const translationService = {
  
  // Get all translations for a menu item
  getItemTranslations: async (itemId: string): Promise<GetTranslationsResponse> => {
    try {
      console.log('Fetching translations for item:', itemId);
      
      const translationsRef = collection(db, MENU_ITEMS_COLLECTION, itemId, TRANSLATIONS_SUBCOLLECTION);
      const querySnapshot = await getDocs(translationsRef);
      
      const translations: Record<string, MenuItemTranslation> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        translations[doc.id] = {
          id: doc.id,
          item_name: data.item_name || '',
          item_description: data.item_description || '',
          translated_options: data.translated_options || [],
          translated_extras: data.translated_extras || [],
          translated_addons: data.translated_addons || [],
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
      
      console.log('Found translations:', Object.keys(translations));
      
      return {
        success: true,
        message: `Found ${Object.keys(translations).length} translations`,
        translations
      };
    } catch (error) {
      console.error('Error fetching translations:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch translations'
      };
    }
  },

  // Get a specific translation
  getTranslation: async (itemId: string, languageCode: string): Promise<TranslationResponse> => {
    try {
      console.log('Fetching translation:', itemId, languageCode);
      
      const translationRef = doc(db, MENU_ITEMS_COLLECTION, itemId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      const translationDoc = await getDoc(translationRef);
      
      if (!translationDoc.exists()) {
        return {
          success: false,
          message: 'Translation not found'
        };
      }
      
      const data = translationDoc.data();
      const translation: MenuItemTranslation = {
        id: translationDoc.id,
        item_name: data.item_name || '',
        item_description: data.item_description || '',
        translated_options: data.translated_options || [],
        translated_extras: data.translated_extras || [],
        translated_addons: data.translated_addons || [],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
      
      return {
        success: true,
        message: 'Translation found',
        translation
      };
    } catch (error) {
      console.error('Error fetching translation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch translation'
      };
    }
  },

  // Create or update a translation
  saveTranslation: async (
    itemId: string, 
    languageCode: string, 
    translationData: CreateTranslationDTO
  ): Promise<TranslationResponse> => {
    try {
      console.log('Saving translation:', itemId, languageCode, translationData);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, MENU_ITEMS_COLLECTION, itemId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent menu item (to update its timestamp)
      const itemRef = doc(db, MENU_ITEMS_COLLECTION, itemId);
      
      // Check if translation already exists
      const existingTranslation = await getDoc(translationRef);
      const now = new Date();
      
      // Prepare translation data with all fields
      const translationDoc = {
        item_name: translationData.item_name,
        item_description: translationData.item_description,
        translated_options: translationData.translated_options || [],
        translated_extras: translationData.translated_extras || [],
        translated_addons: translationData.translated_addons || [],
        updatedAt: now
      };
      
      if (existingTranslation.exists()) {
        // Update existing translation
        batch.update(translationRef, translationDoc);
      } else {
        // Create new translation
        batch.set(translationRef, {
          ...translationDoc,
          createdAt: now
        });
      }
      
      // Update parent item timestamp to trigger cascading updates
      batch.update(itemRef, {
        updatedAt: now
      });
      
      await batch.commit();
      
      console.log('Translation saved successfully');
      
      const savedTranslation: MenuItemTranslation = {
        id: languageCode,
        ...translationDoc
      };
      
      return {
        success: true,
        message: 'Translation saved successfully',
        translation: savedTranslation
      };
    } catch (error) {
      console.error('Error saving translation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save translation'
      };
    }
  },

  // Delete a translation
  deleteTranslation: async (itemId: string, languageCode: string): Promise<TranslationResponse> => {
    try {
      console.log('Deleting translation:', itemId, languageCode);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, MENU_ITEMS_COLLECTION, itemId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent menu item
      const itemRef = doc(db, MENU_ITEMS_COLLECTION, itemId);
      
      // Delete the translation
      batch.delete(translationRef);
      
      // Update parent item timestamp
      batch.update(itemRef, {
        updatedAt: new Date()
      });
      
      await batch.commit();
      
      console.log('Translation deleted successfully');
      
      return {
        success: true,
        message: 'Translation deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting translation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete translation'
      };
    }
  },

  // Get available languages for an item (languages that have translations)
  getAvailableLanguages: async (itemId: string): Promise<string[]> => {
    try {
      const response = await translationService.getItemTranslations(itemId);
      return response.success && response.translations 
        ? Object.keys(response.translations)
        : [];
    } catch (error) {
      console.error('Error fetching available languages:', error);
      return [];
    }
  }
};