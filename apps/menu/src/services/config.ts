// Configuration for the menu app

// Firebase Storage configuration
export const FIREBASE_CONFIG = {
  projectId: 'sebastian-cafe',
  storageBucket: 'sebastian-cafe.firebasestorage.app',
  
  // Base URL for menu JSON files in Firebase Storage
  get menuStorageUrl() {
    return `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o/menus%2F?alt=media&`;
  },
  
  // Direct URL format for individual menu files
  getMenuFileUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o/menus%2F${encodeURIComponent(fileName)}?alt=media`;
  },
  
  // URL for the published menus index
  get menuIndexUrl() {
    return this.getMenuFileUrl('index.json');
  }
};

// App configuration
export const APP_CONFIG = {
  // App title and branding
  restaurantName: "Sebastian Bar & Grill",
  restaurantDescription: "Choose from our delicious menu options",
  facebookURL: "https://www.facebook.com/profile.php?id=100090102195879",
 
  // Cache settings
  cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Error messages
  errorMessages: {
    menuNotFound: 'The requested menu could not be found.',
    networkError: 'Failed to load menu. Please check your internet connection.',
    genericError: 'Something went wrong. Please try again later.'
  },
  
  // Development settings - simplified for now
  isDevelopment: true, // Set to false in production
  enableMockData: true, // Set to false when you have real published menus
};

// Mock data for development (will be removed when using real data)
export const MOCK_PUBLISHED_MENUS = [
  {
    id: 'lunch-menu',
    name: 'Lunch Menu',
    description: 'Fresh lunch options available daily',
    url: FIREBASE_CONFIG.getMenuFileUrl('menu-lunch-menu.json'),
    lastUpdated: '2025-06-15T12:00:00Z'
  },
  {
    id: 'dinner-menu',
    name: 'Dinner Menu',
    description: 'Evening dining selections',
    url: FIREBASE_CONFIG.getMenuFileUrl('menu-dinner-menu.json'),
    lastUpdated: '2025-06-14T18:00:00Z'
  },
  {
    id: 'brunch-menu',
    name: 'Weekend Brunch',
    description: 'Special weekend brunch offerings',
    url: FIREBASE_CONFIG.getMenuFileUrl('menu-brunch-menu.json'),
    lastUpdated: '2025-06-13T10:00:00Z'
  }
];

// Export the storage URL for easy access
export const getMenuStorageUrl = () => FIREBASE_CONFIG.menuStorageUrl;

// Helper to get menu file URL
export const getMenuFileUrl = (fileName: string) => FIREBASE_CONFIG.getMenuFileUrl(fileName);