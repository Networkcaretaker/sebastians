// src/services/menuItemService.ts
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
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
          vegan: Boolean(itemData.flags?.vegan),
          spicy: Boolean(itemData.flags?.spicy),
          extras: Boolean(itemData.extras?.length),
          addons: Boolean(itemData.addons?.length),
          options: Boolean(itemData.options?.length)
        },
        allergies: itemData.allergies || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Log the exact data being sent to Firestore
      console.log('Sanitized data for Firestore:', JSON.stringify(menuItem));
      
      const menuCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(menuCollection, menuItem);
      
      console.log('Menu item added with ID:', docRef.id);
      return { id: docRef.id, ...menuItem };
    } catch (error) {
      console.error('Detailed error adding menu item:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add menu item: ${error.message}`);
      }
      throw error;
    }
  },

  // Initialize menu order for items in the same category
  initializeMenuOrder: async (category: string): Promise<void> => {
    try {
      // Get all items in this category
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      
      // Update each item with its index as menu_order
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc, index) => {
        const itemRef = doc.ref;
        batch.update(itemRef, { 
          menu_order: index,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      console.log(`Initialized menu order for ${querySnapshot.docs.length} items in category: ${category}`);
    } catch (error) {
      console.error('Error initializing menu_order:', error);
      throw error;
    }
  },

  // KEEP ORIGINAL: Update menu order for a single item (DON'T CHANGE THIS!)
  updateSingleMenuOrder: async (itemId: string, newOrder: number): Promise<void> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, { 
        menu_order: newOrder,
        updatedAt: new Date()
      });
      console.log(`Updated menu order for item ${itemId} to ${newOrder}`);
    } catch (error) {
      console.error('Error updating menu_order:', error);
      throw error;
    }
  },

  // ADD NEW: Batch update menu order for multiple items (for CategorySort.tsx)
  updateMenuOrder: async (orderUpdates: Array<{ id: string; menu_order: number }>): Promise<void> => {
    try {
      const batch = writeBatch(db);
      const updateTime = new Date();
      
      orderUpdates.forEach(({ id, menu_order }) => {
        const itemRef = doc(db, COLLECTION_NAME, id);
        batch.update(itemRef, { 
          menu_order,
          updatedAt: updateTime
        });
      });
      
      await batch.commit();
      console.log(`Updated menu order for ${orderUpdates.length} items`);
    } catch (error) {
      console.error('Error updating menu orders:', error);
      throw error;
    }
  },

  // Get all menu items
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    try {
      console.log('Fetching all menu items');
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
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

  // Update menu item - WITH updatedAt FIELD
  updateMenuItem: async (itemId: string, updateData: UpdateMenuItemDTO): Promise<MenuItem> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      
      // Add updatedAt timestamp to the update data
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(itemRef, dataWithTimestamp);
      console.log(`Menu item ${itemId} updated successfully with timestamp`);
      return { id: itemId, ...dataWithTimestamp } as MenuItem;
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

  // Toggle item status (active/inactive) - WITH updatedAt FIELD
  toggleItemStatus: async (itemId: string, isActive: boolean): Promise<ToggleStatusResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        'flags.active': isActive,
        updatedAt: new Date()
      });
      return { id: itemId, isActive };
    } catch (error) {
      console.error('Error toggling item status:', error);
      throw error;
    }
  },

  // Add/Update extras - WITH updatedAt FIELD
  updateExtras: async (itemId: string, extras: MenuItemExtra[]): Promise<UpdateExtrasResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        extras: extras,
        'flags.extras': extras.length > 0,
        updatedAt: new Date()
      });
      return { id: itemId, extras };
    } catch (error) {
      console.error('Error updating extras:', error);
      throw error;
    }
  },

  // Add/Update options - WITH updatedAt FIELD
  updateOptions: async (itemId: string, options: MenuItemOption[]): Promise<UpdateOptionsResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        options: options,
        'flags.options': options.length > 0,
        updatedAt: new Date()
      });
      return { id: itemId, options };
    } catch (error) {
      console.error('Error updating options:', error);
      throw error;
    }
  },

  // Update allergies - WITH updatedAt FIELD
  updateAllergies: async (itemId: string, allergies: string[]): Promise<UpdateAllergiesResponse> => {
    try {
      const itemRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(itemRef, {
        allergies: allergies,
        updatedAt: new Date()
      });
      return { id: itemId, allergies };
    } catch (error) {
      console.error('Error updating allergies:', error);
      throw error;
    }
  }
};

export default menuService;