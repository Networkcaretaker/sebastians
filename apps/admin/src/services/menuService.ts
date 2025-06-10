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
  writeBatch
} from 'firebase/firestore';

import {
  MenuItem,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  ToggleStatusResponse,
  UpdateExtrasResponse,
  UpdateOptionsResponse,
  UpdateAllergiesResponse,
  MenuItemExtra,
  MenuItemOption
} from '../types/menu.types';

const COLLECTION_NAME = 'menu_items';

export const menuService = {
  // Add new menu item
  addMenuItem: async (itemData: CreateMenuItemDTO): Promise<MenuItem> => {
    try {
      console.log('Adding menu item:', itemData);
      
      // Create a plain object with only the necessary data
      // This helps avoid any potential issues with class instances or non-serializable data
      const menuItem = {
        item_name: itemData.item_name,
        item_description: itemData.item_description,
        category: itemData.category,
        price: Number(itemData.price), // Ensure it's a number
        options: itemData.options || [],
        extras: itemData.extras || [],
        addons: itemData.addons || [],
        menu_order: itemData.menu_order || 0, // Include menu_order
        flags: {
          active: Boolean(itemData.flags?.active),
          vegetarian: Boolean(itemData.flags?.vegetarian),
          extras: Boolean(itemData.extras?.length),
          addons: Boolean(itemData.addons?.length),
          options: Boolean(itemData.options?.length)
        },
        allergies: itemData.allergies || []
      };

      // Log the exact data being sent to Firestore
      console.log('Sanitized data for Firestore:', JSON.stringify(menuItem));
      
      const menuCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(menuCollection, menuItem);
      
      console.log('Document added with ID:', docRef.id);
      return { id: docRef.id, ...menuItem };
    } catch (error) {
      console.error('Detailed error adding menu item:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add menu item: ${error.message}`);
      }
      throw error;
    }
  },

  initializeMenuOrder: async (categoryId: string): Promise<void> => {
    try {
      // Get all items in this category
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', categoryId)
      );
      const querySnapshot = await getDocs(q);
      
      // If there are no items, just return
      if (querySnapshot.empty) return;
      
      const batch = writeBatch(db);
      
      // For each item, set menu_order if it doesn't exist
      querySnapshot.docs.forEach((docSnapshot, index) => {
        const itemData = docSnapshot.data();
        if (itemData.menu_order === undefined) {
          const itemRef = doc(db, COLLECTION_NAME, docSnapshot.id);
          batch.update(itemRef, { menu_order: index });
        }
      });
      
      await batch.commit();
      console.log(`Initialized menu_order for items in category ${categoryId}`);
    } catch (error) {
      console.error('Error initializing menu_order:', error);
      throw error;
    }
  },

  // Update menu_order for multiple items
  updateMenuOrder: async (items: { id: string; menu_order: number }[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      items.forEach(item => {
        const itemRef = doc(db, COLLECTION_NAME, item.id);
        batch.update(itemRef, { menu_order: item.menu_order });
      });
      
      await batch.commit();
      console.log('Updated menu_order for multiple items');
    } catch (error) {
      console.error('Error updating menu_order:', error);
      throw error;
    }
  },

  // Get all menu items
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    try {
      console.log('Fetching all menu items');
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      const items = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Item ${doc.id} data:`, data);
        return {
          id: doc.id,
          ...data
        };
      }) as MenuItem[];
      
      return items;
    } catch (error) {
      console.error('Error getting menu items:', error);
      throw error;
    }
  },

  // Get active menu items
  getActiveMenuItems: async (): Promise<MenuItem[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('flags.active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
    } catch (error) {
      console.error('Error getting active menu items:', error);
      throw error;
    }
  },

  // Update menu item
  updateMenuItem: async (itemId: string, updateData: UpdateMenuItemDTO): Promise<MenuItem> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, updateData);
      return { id: itemId, ...updateData } as MenuItem;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete menu item
  deleteMenuItem: async (itemId: string): Promise<string> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, itemId));
      return itemId;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  // Toggle item status (active/inactive)
  toggleItemStatus: async (itemId: string, isActive: boolean): Promise<ToggleStatusResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        'flags.active': isActive
      });
      return { id: itemId, isActive };
    } catch (error) {
      console.error('Error toggling item status:', error);
      throw error;
    }
  },

  // Add/Update extras
  updateExtras: async (itemId: string, extras: MenuItemExtra[]): Promise<UpdateExtrasResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        extras: extras,
        'flags.extras': extras.length > 0
      });
      return { id: itemId, extras };
    } catch (error) {
      console.error('Error updating extras:', error);
      throw error;
    }
  },

  // Add/Update options
  updateOptions: async (itemId: string, options: MenuItemOption[]): Promise<UpdateOptionsResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        options: options,
        'flags.options': options.length > 0
      });
      return { id: itemId, options };
    } catch (error) {
      console.error('Error updating options:', error);
      throw error;
    }
  },

  // Update allergies
  updateAllergies: async (itemId: string, allergies: string[]): Promise<UpdateAllergiesResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        allergies: allergies
      });
      return { id: itemId, allergies };
    } catch (error) {
      console.error('Error updating allergies:', error);
      throw error;
    }
  }
};

export default menuService;