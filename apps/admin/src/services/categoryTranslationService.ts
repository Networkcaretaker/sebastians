// apps/admin/src/services/categoryTranslationService.ts

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
  CategoryTranslation,
  CreateCategoryTranslationDTO,
  UpdateCategoryTranslationDTO,
  CategoryTranslationResponse,
  GetCategoryTranslationsResponse
} from '../types/menu.types';

const CATEGORIES_COLLECTION = 'categories';
const TRANSLATIONS_SUBCOLLECTION = 'translations';

export const categoryTranslationService = {
  
  // Get all translations for a category
  getCategoryTranslations: async (categoryId: string): Promise<GetCategoryTranslationsResponse> => {
    try {
      console.log('Fetching translations for category:', categoryId);
      
      const translationsRef = collection(db, CATEGORIES_COLLECTION, categoryId, TRANSLATIONS_SUBCOLLECTION);
      const querySnapshot = await getDocs(translationsRef);
      
      const translations: Record<string, CategoryTranslation> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        translations[doc.id] = {
          id: doc.id,
          cat_name: data.cat_name || '',
          cat_description: data.cat_description || '',
          header: data.header || '',
          footer: data.footer || '',
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
  getCategoryTranslation: async (categoryId: string, languageCode: string): Promise<CategoryTranslationResponse> => {
    try {
      console.log('Fetching translation:', categoryId, languageCode);
      
      const translationRef = doc(db, CATEGORIES_COLLECTION, categoryId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      const translationDoc = await getDoc(translationRef);
      
      if (!translationDoc.exists()) {
        return {
          success: false,
          message: 'Translation not found'
        };
      }
      
      const data = translationDoc.data();
      const translation: CategoryTranslation = {
        id: translationDoc.id,
        cat_name: data.cat_name || '',
        cat_description: data.cat_description || '',
        header: data.header || '',
        footer: data.footer || '',
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
  saveCategoryTranslation: async (
    categoryId: string, 
    languageCode: string, 
    translationData: CreateCategoryTranslationDTO
  ): Promise<CategoryTranslationResponse> => {
    try {
      console.log('Saving translation:', categoryId, languageCode, translationData);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, CATEGORIES_COLLECTION, categoryId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent category (to update its timestamp)
      const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      
      // Check if translation already exists
      const existingTranslation = await getDoc(translationRef);
      const now = new Date();
      
      // Prepare translation data with all fields
      const translationDoc = {
        cat_name: translationData.cat_name,
        cat_description: translationData.cat_description,
        header: translationData.header,
        footer: translationData.footer,
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
      
      // Update parent category timestamp to trigger cascading updates
      batch.update(categoryRef, {
        updatedAt: now
      });
      
      await batch.commit();
      
      console.log('Translation saved successfully');
      
      const savedTranslation: CategoryTranslation = {
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
  deleteCategoryTranslation: async (categoryId: string, languageCode: string): Promise<CategoryTranslationResponse> => {
    try {
      console.log('Deleting translation:', categoryId, languageCode);
      
      const batch = writeBatch(db);
      
      // Reference to the translation document
      const translationRef = doc(db, CATEGORIES_COLLECTION, categoryId, TRANSLATIONS_SUBCOLLECTION, languageCode);
      
      // Reference to the parent category
      const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      
      // Delete the translation
      batch.delete(translationRef);
      
      // Update parent category timestamp
      batch.update(categoryRef, {
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

  // Get available languages for a category (languages that have translations)
  getAvailableCategoryLanguages: async (categoryId: string): Promise<string[]> => {
    try {
      const response = await categoryTranslationService.getCategoryTranslations(categoryId);
      return response.success && response.translations 
        ? Object.keys(response.translations)
        : [];
    } catch (error) {
      console.error('Error fetching available languages:', error);
      return [];
    }
  }
};