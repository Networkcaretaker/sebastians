// src/services/documentService.ts
import { DOC_FIREBASE_CONFIG } from './docConfig';

export const documentService = {
  getMenuData: async (menuId: string) => {
    try {
      const url = DOC_FIREBASE_CONFIG.getMenuFileUrl(menuId);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Menu not found. Has it been published yet?`);
      }

      const data = await response.json();
      
      // We return the data as-is since the generated JSON 
      // already follows the 'GeneratedMenu' interface.
      return data;
    } catch (error) {
      console.error('Error fetching printable menu:', error);
      throw error;
    }
  }
};