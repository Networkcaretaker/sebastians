// Menu Service for fetching published menu data from Firebase Storage JSON files
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FIREBASE_CONFIG, APP_CONFIG, MOCK_PUBLISHED_MENUS } from './config';

export interface MenuItem {
  id: string;
  item_name: string;
  item_description?: string;
  item_price: number;
  item_order: number;
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  cat_name: string;
  cat_description?: string;
  cat_header?: string;
  cat_footer?: string;
  cat_order: number;
  extras?: Array<{ item: string; price: number; }>;
  addons?: Array<{ item: string; }>;
  items: MenuItem[];
}

export interface MenuData {
  id: string;
  menu_name: string;
  menu_description: string;
  menu_type: 'web' | 'printable';
  categories: MenuCategory[];
  lastUpdated: string;
  publishedUrl?: string;
}

export interface PublishedMenu {
  id: string;
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
  slug?: string;
}

/**
 * Fetches the list of published menus from Firestore websiteConfig collection
 */
export const getPublishedMenus = async (): Promise<PublishedMenu[]> => {
  try {
    console.log('🔍 Fetching published menus from Firestore websiteConfig...');
    
    // Fetch the websiteConfig document from Firestore
    const websiteConfigRef = doc(db, 'websiteConfig', 'default');
    const websiteConfigSnap = await getDoc(websiteConfigRef);
    
    if (!websiteConfigSnap.exists()) {
      console.warn('⚠️ No websiteConfig document found');
      
      if (APP_CONFIG.enableMockData) {
        console.warn('🎭 Using mock data for development');
        return MOCK_PUBLISHED_MENUS;
      }
      
      return [];
    }
    
    const websiteConfig = websiteConfigSnap.data();
    console.log('✅ Fetched websiteConfig:', websiteConfig);
    
    const publishedMenus = websiteConfig.publishedMenus || [];
    console.log('📋 Published menus array:', publishedMenus);
    
    if (!Array.isArray(publishedMenus) || publishedMenus.length === 0) {
      console.warn('⚠️ No published menus found in websiteConfig');
      
      if (APP_CONFIG.enableMockData) {
        console.warn('🎭 Using mock data for development');
        return MOCK_PUBLISHED_MENUS;
      }
      
      return [];
    }

    // Transform the Firestore data to match our interface
    const transformedMenus = publishedMenus
      .filter((menu: any) => menu.isActive !== false) // Only active menus
      .map((menu: any) => {
        console.log('🔍 Processing menu from Firestore:', menu);
        console.log('📝 Menu ID from Firestore:', menu.menuId);
        console.log('🔗 Published URL from Firestore:', menu.publishedUrl);
        
        return {
          id: menu.menuId,
          name: menu.name,
          description: menu.description || '',
          url: menu.publishedUrl,
          lastUpdated: menu.publishedAt || new Date().toISOString(),
          slug: menu.menuId
        };
      });

    console.log('🔄 Transformed published menus:', transformedMenus);
    return transformedMenus;

  } catch (error) {
    console.error('💥 Error fetching published menus from Firestore:', error);
    
    // Use mock data in development if the service fails
    if (APP_CONFIG.enableMockData) {
      console.warn('🎭 Using mock data due to Firestore error');
      return MOCK_PUBLISHED_MENUS;
    }
    
    return [];
  }
};

/**
 * Fetches a specific menu's data from its JSON file
 * Uses the publishedUrl from Firestore to ensure correct URL
 */
export const getMenuData = async (menuId: string): Promise<MenuData | null> => {
  try {
    console.log('🔍 Getting menu data for ID:', menuId);
    
    // Get the published URL from Firestore to ensure we have the correct URL
    const publishedMenus = await getPublishedMenus();
    const targetMenu = publishedMenus.find(menu => menu.id === menuId);
    
    let menuUrl: string;
    
    if (targetMenu && targetMenu.url) {
      menuUrl = targetMenu.url;
      console.log('✅ Using published URL from Firestore:', menuUrl);
    } else {
      // Fallback: construct URL
      menuUrl = FIREBASE_CONFIG.getMenuFileUrl(`menu-${menuId}.json`);
      console.log('⚠️ Constructing URL as fallback:', menuUrl);
    }
    
    console.log('🔍 Fetching menu data from:', menuUrl);
    
    const response = await fetch(menuUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    console.log('📡 Menu response status:', response.status);

    if (!response.ok) {
      console.error(`❌ Failed to fetch menu ${menuId}:`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Successfully fetched menu data:', data);
    return transformMenuData(data, menuId, menuUrl);

  } catch (error) {
    console.error(`💥 Error fetching menu data for ${menuId}:`, error);
    return null;
  }
};

/**
 * Helper function to transform menu data
 */
const transformMenuData = (data: any, menuId: string, url: string): MenuData => {
  return {
    id: menuId || data.menu.id,
    menu_name: data.menu.name || 'Untitled Menu',
    menu_description: data.menu.description || '',
    menu_type: data.menu.type || 'web',
    lastUpdated: data.lastUpdated || data.updatedAt || new Date().toISOString(),
    publishedUrl: url,
    categories: (data.categories || []).map((category: any) => ({
      id: category.id,
      cat_name: category.cat_name || category.name,
      cat_description: category.cat_description || category.description,
      cat_header: category.cat_header || category.header,
      cat_footer: category.cat_footer || category.footer,
      cat_order: category.cat_order || category.order || 0,
      extras: category.extras || [],
      addons: category.addons || [],
      items: (category.items || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name || item.name,
        item_description: item.item_description || item.description,
        item_price: parseFloat(item.item_price || item.price || '0'),
        item_order: item.item_order || item.order || 0,
        addons: item.addons || [],
        options: item.options || [],
        extras: item.extras || [],
        allergies: item.allergies || [],
        vegetarian: item.flags.vegetarian || false,
        isActive: item.flags.active !== false // Default to true if not specified
      }))
    }))
  };
};

/**
 * Helper function to get the Firebase Storage bucket URL
 */
export const getStorageBucketUrl = (): string => {
  return FIREBASE_CONFIG.menuStorageUrl;
};

/**
 * Helper function to validate if a URL is accessible
 */
export const validateMenuUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Development helper - you can remove this in production
 */
export const getAvailableMenus = async (): Promise<string[]> => {
  // This would list all available menu JSON files
  // For now, return known menu IDs
  const publishedMenus = await getPublishedMenus();
  return publishedMenus.map(menu => menu.id);
};