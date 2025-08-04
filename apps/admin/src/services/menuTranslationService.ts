// apps/admin/src/services/menuTranslationService.ts

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
  MenuTranslation,
  CreateMenuTranslationDTO,
  UpdateMenuTranslationDTO,
  MenuTranslationResponse,
  GetMenuTranslationsResponse
} from '../types/menu.types';

const MENUS_COLLECTION = 'menus';
const TRANSLATIONS_SUBCOLLECTION = 'translations';

export const menuTranslationService = {
  
  // Get all translations for a menu
  getMenuTranslations: async (menuId: string): Promise<GetMenuTranslationsResponse> => {
    try {      
      const translationsRef = collection(db, MENUS_COLLECTION, menuId, TRANSLATIONS_SUBCOLLECTION);
      const querySnapshot = await getDocs(translationsRef);
      const translations: Record<string, MenuTranslation> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        translations[doc.id] = {
          id: doc.id,
          menu_name: data.menu_name || '',
          menu_description: data.menu_description || '',
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
  getMenuTranslation: async (menuId: string, languageCode: string): Promise<MenuTranslationResponse> => {
    try {
      console.log('Fetching translation:', menuId, languageCode);
      
      const translationRef = doc(db, MENUS_COLLECTION, menuId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      const translationDoc = await getDoc(translationRef);
      
      if (!translationDoc.exists()) {
        return {
          success: false,
          message: 'Translation not found'
        };
      }
      
      const data = translationDoc.data();
      const translation: MenuTranslation = {
        id: translationDoc.id,
        menu_name: data.menu_name || '',
        menu_description: data.menu_description || '',
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
  saveMenuTranslation: async (
    menuId: string, 
    languageCode: string, 
    translationData: CreateMenuTranslationDTO
  ): Promise<MenuTranslationResponse> => {
    try {
      console.log('Saving translation:', menuId, languageCode, translationData);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, MENUS_COLLECTION, menuId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent menu (to update its timestamp)
      const menuRef = doc(db, MENUS_COLLECTION, menuId);
      
      // Check if translation already exists
      const existingTranslation = await getDoc(translationRef);
      const now = new Date();
      
      // Prepare translation data with all fields
      const translationDoc = {
        menu_name: translationData.menu_name,
        menu_description: translationData.menu_description,
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
      
      // Update parent menu timestamp to trigger cascading updates
      batch.update(menuRef, {
        updatedAt: now
      });
      
      await batch.commit();
      
      console.log('Translation saved successfully');
      
      const savedTranslation: MenuTranslation = {
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
  deleteMenuTranslation: async (menuId: string, languageCode: string): Promise<MenuTranslationResponse> => {
    try {
      console.log('Deleting translation:', menuId, languageCode);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, MENUS_COLLECTION, menuId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent menu
      const menuRef = doc(db, MENUS_COLLECTION, menuId);
      
      // Delete the translation
      batch.delete(translationRef);
      
      // Update parent menu timestamp
      batch.update(menuRef, {
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

  // Get available languages for a menu (languages that have translations)
  getAvailableMenuLanguages: async (menuId: string): Promise<string[]> => {
    try {
      const response = await menuTranslationService.getMenuTranslations(menuId);
      return response.success && response.translations 
        ? Object.keys(response.translations)
        : [];
    } catch (error) {
      console.error('Error fetching available languages:', error);
      return [];
    }
  }
};