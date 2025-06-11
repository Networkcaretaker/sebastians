// src/services/menuService.ts
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';

import {
  Menu,
  CreateMenuDTO,
  UpdateMenuDTO,
  ToggleMenuStatusResponse,
  UpdateMenuCategoriesResponse
} from '../types/menu.types';

const COLLECTION_NAME = 'menus';

export const menuService = {
  // Add new menu
  addMenu: async (menuData: CreateMenuDTO): Promise<Menu> => {
    try {
      console.log('Adding menu:', menuData);
      
      // Create a plain object with only the necessary data
      const menu = {
        menu_name: menuData.menu_name,
        menu_description: menuData.menu_description,
        menu_type: menuData.menu_type,
        categories: menuData.categories || [],
        isActive: Boolean(menuData.isActive),
        menu_order: menuData.menu_order || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Sanitized data for Firestore:', JSON.stringify(menu));
      
      const menuCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(menuCollection, menu);
      
      console.log('Menu added with ID:', docRef.id);
      return { id: docRef.id, ...menu };
    } catch (error) {
      console.error('Detailed error adding menu:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add menu: ${error.message}`);
      }
      throw error;
    }
  },

  // Initialize menu order for menus of the same type
  initializeMenuOrder: async (menuType: 'web' | 'printable'): Promise<void> => {
    try {
      // Get all menus of this type
      const q = query(
        collection(db, COLLECTION_NAME),
        where('menu_type', '==', menuType),
        orderBy('menu_order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      // If there are no menus, just return
      if (querySnapshot.empty) return;
      
      const batch = writeBatch(db);
      
      // For each menu, set menu_order if it doesn't exist
      querySnapshot.docs.forEach((docSnapshot, index) => {
        const menuData = docSnapshot.data();
        if (menuData.menu_order === undefined) {
          const menuRef = doc(db, COLLECTION_NAME, docSnapshot.id);
          batch.update(menuRef, { menu_order: index });
        }
      });
      
      await batch.commit();
      console.log(`Initialized menu_order for ${menuType} menus`);
    } catch (error) {
      console.error('Error initializing menu_order:', error);
      throw error;
    }
  },

  // Update menu_order for multiple menus
  updateMenuOrder: async (menus: { id: string; menu_order: number }[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      menus.forEach(menu => {
        const menuRef = doc(db, COLLECTION_NAME, menu.id);
        batch.update(menuRef, { 
          menu_order: menu.menu_order,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      console.log('Updated menu_order for multiple menus');
    } catch (error) {
      console.error('Error updating menu_order:', error);
      throw error;
    }
  },

  // Get all menus
  getAllMenus: async (): Promise<Menu[]> => {
    try {
      console.log('Fetching all menus');
      const q = query(collection(db, COLLECTION_NAME), orderBy('menu_order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const menus = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Menu ${doc.id} data:`, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }) as Menu[];
      
      return menus;
    } catch (error) {
      console.error('Error getting menus:', error);
      throw error;
    }
  },

  // Get menus by type
  getMenusByType: async (menuType: 'web' | 'printable'): Promise<Menu[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('menu_type', '==', menuType),
        orderBy('menu_order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Menu[];
    } catch (error) {
      console.error('Error getting menus by type:', error);
      throw error;
    }
  },

  // Get active menus
  getActiveMenus: async (): Promise<Menu[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('menu_order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Menu[];
    } catch (error) {
      console.error('Error getting active menus:', error);
      throw error;
    }
  },

  // Update menu
  updateMenu: async (menuId: string, updateData: UpdateMenuDTO): Promise<Menu> => {
    try {
      const menuRef = doc(db, COLLECTION_NAME, menuId);
      const dataToUpdate = {
        ...updateData,
        updatedAt: new Date()
      };
      await updateDoc(menuRef, dataToUpdate);
      return { id: menuId, ...dataToUpdate } as Menu;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },

  // Delete menu
  deleteMenu: async (menuId: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, menuId));
      return menuId;
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  },

  // Toggle menu status (active/inactive)
  toggleMenuStatus: async (menuId: string, isActive: boolean): Promise<ToggleMenuStatusResponse> => {
    try {
      const menuRef = doc(db, COLLECTION_NAME, menuId);
      await updateDoc(menuRef, {
        isActive: isActive,
        updatedAt: new Date()
      });
      return { id: menuId, isActive };
    } catch (error) {
      console.error('Error toggling menu status:', error);
      throw error;
    }
  },

  // Update menu categories
  updateMenuCategories: async (menuId: string, categories: string[]): Promise<UpdateMenuCategoriesResponse> => {
    try {
      const menuRef = doc(db, COLLECTION_NAME, menuId);
      await updateDoc(menuRef, {
        categories: categories,
        updatedAt: new Date()
      });
      return { id: menuId, categories };
    } catch (error) {
      console.error('Error updating menu categories:', error);
      throw error;
    }
  }
};

export default menuService;