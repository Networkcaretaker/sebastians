import {onCall} from "firebase-functions/v2/https";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

export { autoTranslateItem } from './translate';
export { autoTranslateCategory } from './translate';
export { autoTranslateMenu } from './translate';
export { exportMenuJson } from './publish';
export { processMenuImage, processCategoryImage } from './image';

/**
 * Export Menu Function
 * Takes a menuId and returns complete menu data as JSON
 */
export const exportMenu = onCall(async (request: any) => {
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

    logger.info(`${action} menu: ${menuId}`);

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
    logger.info(`Exporting menu: ${menuId}`);

    // Get the menu
    const menuDoc = await db.collection('menus').doc(menuId).get();
    if (!menuDoc.exists) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    const menuData: any = menuDoc.data();
    
    // Get categories
    const categoryPromises = menuData.categories.map((categoryId: string) => 
      db.collection('categories').doc(categoryId).get()
    );
    const categoryDocs = await Promise.all(categoryPromises);
    
    // Get menu items for each category
    const categories = [];
    for (const categoryDoc of categoryDocs) {
      if (categoryDoc.exists) {
        const categoryData: any = categoryDoc.data();
        
        // Get items for this category
        const items = [];
        if (categoryData.items && categoryData.items.length > 0) {
          const itemPromises = categoryData.items.map((itemId: string) => 
            db.collection('menu_items').doc(itemId).get()
          );
          const itemDocs = await Promise.all(itemPromises);
          
          for (const itemDoc of itemDocs) {
            if (itemDoc.exists) {
              items.push({
                id: itemDoc.id,
                ...itemDoc.data()
              });
            }
          }
          
          // Sort items by menu_order
          items.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0));
        }
        
        categories.push({
          id: categoryDoc.id,
          name: categoryData.cat_name,
          header: categoryData.header,
          description: categoryData.cat_description,
          footer: categoryData.footer,
          items: items,
          addons: categoryData.addons,
          extras: categoryData.extras
        });
      }
    }

    // Build the complete menu JSON
    const completeMenu = {
      menu: {
        id: menuId,
        name: menuData.menu_name,
        description: menuData.menu_description,
        type: menuData.menu_type
      },
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

    logger.info(`Menu export completed: ${categories.length} categories, saved to ${publicUrl}`);

    return {
      success: true,
      message: `Menu exported successfully`,
      data: completeMenu,
      url: publicUrl
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

// Simple test function
export const helloWorld = onRequest((request: any, response: any) => {
  response.send("Hello from Firebase Functions!");
});