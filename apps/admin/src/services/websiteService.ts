import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import app from '../config/firebase';
import { 
  WebsiteConfig, 
  UpdateWebsiteConfigDTO, 
  PublishMenuRequest, 
  PublishMenuResponse,
  MenuWithPublishStatus
} from '@sebastians/shared-types';

const WEBSITE_CONFIG_COLLECTION = 'websiteConfig';
const MENUS_COLLECTION = 'menus';
const WEBSITE_CONFIG_DOC_ID = 'default';

// Initialize Firebase Functions
const functions = getFunctions(app);
//const exportMenuFunction = httpsCallable(functions, 'exportMenu');
const exportMenuFunction = httpsCallable(functions, 'exportMenuJson');

/**
 * Get the current website configuration
 */
export const getWebsiteConfig = async (): Promise<WebsiteConfig | null> => {
  try {
    const docRef = doc(db, WEBSITE_CONFIG_COLLECTION, WEBSITE_CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate(),
        createdAt: data.createdAt?.toDate(),
        publishedMenus: data.publishedMenus?.map((menu: any) => ({
          ...menu,
          publishedAt: menu.publishedAt?.toDate(),
          lastPublished: menu.lastPublished?.toDate()
        })) || []
      } as WebsiteConfig;
    }
    
    return getDefaultWebsiteConfig();
  } catch (error) {
    console.error('Error fetching website config:', error);
    throw error;
  }
};

/**
 * Update website configuration
 */
export const updateWebsiteConfig = async (updates: UpdateWebsiteConfigDTO): Promise<WebsiteConfig> => {
  try {
    const docRef = doc(db, WEBSITE_CONFIG_COLLECTION, WEBSITE_CONFIG_DOC_ID);
    const now = new Date();
    
    const updateData = {
      publishedMenus: updates.publishedMenus || [],
      lastUpdated: Timestamp.fromDate(now)
    };
    
    await updateDoc(docRef, updateData);
    
    const updated = await getWebsiteConfig();
    if (!updated) {
      throw new Error('Failed to retrieve updated website config');
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating website config:', error);
    throw error;
  }
};

/**
 * Create initial website configuration if it doesn't exist
 */
export const initializeWebsiteConfig = async (): Promise<WebsiteConfig> => {
  try {
    const existing = await getWebsiteConfig();
    if (existing && existing.id) {
      return existing;
    }
    
    const defaultConfig = getDefaultWebsiteConfig();
    const docRef = doc(db, WEBSITE_CONFIG_COLLECTION, WEBSITE_CONFIG_DOC_ID);
    const now = new Date();
    
    const configData = {
      ...defaultConfig,
      createdAt: Timestamp.fromDate(now),
      lastUpdated: Timestamp.fromDate(now)
    };
    
    await setDoc(docRef, configData);
    
    return {
      id: WEBSITE_CONFIG_DOC_ID,
      ...defaultConfig,
      createdAt: now,
      lastUpdated: now
    };
  } catch (error) {
    console.error('Error initializing website config:', error);
    throw error;
  }
};

/**
 * Publish a menu using the Firebase function
 */
export const publishMenu = async (menuId: string): Promise<PublishMenuResponse> => {
  try {
    const request: PublishMenuRequest = {
      menuId,
      action: 'publish'
    };
    
    const result = await exportMenuFunction(request);
    const response = result.data as any;
    
    if (response.success) {
      await updateMenuPublishStatus(menuId, 'published', response.url);
      await addPublishedMenuToConfig(menuId, response.url);
      
      return {
        success: true,
        menuId,
        url: response.url,
        publishedAt: new Date(),
        message: 'Menu published successfully'
      };
    } else {
      return {
        success: false,
        menuId,
        error: response.message || 'Failed to publish menu'
      };
    }
  } catch (error) {
    console.error('Error publishing menu:', error);
    return {
      success: false,
      menuId,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Unpublish a menu - now with storage cleanup
 */
export const unpublishMenu = async (menuId: string): Promise<PublishMenuResponse> => {
  try {
    const request: PublishMenuRequest = {
      menuId,
      action: 'unpublish'  // Add this parameter
    };
    
    // Call the same function but with unpublish action
    const result = await exportMenuFunction(request);
    const response = result.data as any;
    
    if (response.success) {
      // Update the menu's publish status in Firestore
      await updateMenuPublishStatus(menuId, 'unpublished');
      
      // Remove from website config
      await removePublishedMenuFromConfig(menuId);
      
      return {
        success: true,
        menuId,
        message: 'Menu unpublished and files removed successfully'
      };
    } else {
      return {
        success: false,
        menuId,
        error: response.message || 'Failed to unpublish menu'
      };
    }
  } catch (error) {
    console.error('Error unpublishing menu:', error);
    return {
      success: false,
      menuId,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get all menus with their publication status
 */
export const getMenusWithPublishStatus = async (): Promise<MenuWithPublishStatus[]> => {
  try {
    const menusRef = collection(db, MENUS_COLLECTION);
    const snapshot = await getDocs(menusRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        menu_name: data.menu_name,
        menu_description: data.menu_description,
        menu_type: data.menu_type,
        categories: data.categories || [],
        isActive: data.isActive,
        menu_order: data.menu_order,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        publishStatus: data.publishStatus || 'draft',
        publishedAt: data.publishedAt?.toDate(),
        publishedUrl: data.publishedUrl,
        lastPublished: data.lastPublished?.toDate()
      } as MenuWithPublishStatus;
    });
  } catch (error) {
    console.error('Error fetching menus with publish status:', error);
    throw error;
  }
};

/**
 * Helper function to update menu publish status
 */
const updateMenuPublishStatus = async (
  menuId: string, 
  status: 'published' | 'unpublished' | 'draft',
  url?: string
): Promise<void> => {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    const updateData: any = {
      publishStatus: status,
      lastPublished: Timestamp.fromDate(new Date())
    };
    
    if (status === 'published' && url) {
      updateData.publishedUrl = url;
      updateData.publishedAt = Timestamp.fromDate(new Date());
    } else if (status === 'unpublished') {
      updateData.publishedUrl = null;
    }
    
    await updateDoc(menuRef, updateData);
  } catch (error) {
    console.error('Error updating menu publish status:', error);
    throw error;
  }
};

/**
 * Helper function to add published menu to website config
 */
const addPublishedMenuToConfig = async (menuId: string, url: string): Promise<void> => {
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    const menuSnap = await getDoc(menuRef);
    
    if (!menuSnap.exists()) {
      throw new Error('Menu not found');
    }
    
    const menuData = menuSnap.data() as MenuWithPublishStatus;
    const config = await getWebsiteConfig();
    
    if (!config) {
      throw new Error('Website config not found');
    }
    
    const slug = menuData.menu_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Clean existing menus to remove undefined values
    const cleanedExistingMenus = config.publishedMenus
      .filter(m => m.menuId !== menuId)
      .map(menu => {
        const cleanMenu: any = {
          menuId: menu.menuId,
          name: menu.name,
          slug: menu.slug,
          description: menu.description || '',
          isActive: menu.isActive !== false,
          order: menu.order || 0,
          publishedAt: menu.publishedAt,
          publishedUrl: menu.publishedUrl
        };
        
        if (menu.lastPublished !== undefined) {
          cleanMenu.lastPublished = menu.lastPublished;
        }
        
        return cleanMenu;
      });
    
    const newMenuEntry = {
      menuId,
      name: menuData.menu_name,
      slug,
      description: menuData.menu_description || '',
      isActive: menuData.isActive !== false,
      order: menuData.menu_order || 0,
      publishedAt: new Date(),
      publishedUrl: url
    };
    
    const updatedMenus = [...cleanedExistingMenus, newMenuEntry];
    updatedMenus.sort((a, b) => a.order - b.order);
    
    await updateWebsiteConfig({
      publishedMenus: updatedMenus
    });
  } catch (error) {
    console.error('Error adding published menu to config:', error);
    throw error;
  }
};

/**
 * Helper function to remove published menu from website config
 */
const removePublishedMenuFromConfig = async (menuId: string): Promise<void> => {
  try {
    const config = await getWebsiteConfig();
    
    if (!config) {
      return;
    }
    
    // Clean remaining menus to remove undefined values
    const cleanedRemainingMenus = config.publishedMenus
      .filter(m => m.menuId !== menuId)
      .map(menu => {
        const cleanMenu: any = {
          menuId: menu.menuId,
          name: menu.name,
          slug: menu.slug,
          description: menu.description || '',
          isActive: menu.isActive !== false,
          order: menu.order || 0,
          publishedAt: menu.publishedAt,
          publishedUrl: menu.publishedUrl
        };
        
        if (menu.lastPublished !== undefined) {
          cleanMenu.lastPublished = menu.lastPublished;
        }
        
        return cleanMenu;
      });
    
    await updateWebsiteConfig({
      publishedMenus: cleanedRemainingMenus
    });
  } catch (error) {
    console.error('Error removing published menu from config:', error);
    throw error;
  }
};

/**
 * Get default website configuration
 */
const getDefaultWebsiteConfig = (): Omit<WebsiteConfig, 'id' | 'createdAt'> => {
  return {
    restaurant: {
      name: "Sebastian's Restaurant",
      description: "Fine dining experience with exceptional cuisine",
      contactInfo: {
        email: "",
        phone: "",
        address: "",
        website: "",
        facebook: ""
      }
    },
    publishedMenus: [],
    theme: {
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      backgroundColor: "#ffffff",
      fontFamily: "Inter"
    },
    seo: {
      metaTitle: "Sebastian's Restaurant - Menu",
      metaDescription: "Discover our exceptional menu with carefully crafted dishes",
      keywords: ["restaurant", "menu", "dining", "food"]
    },
    lastUpdated: new Date()
  };
};
