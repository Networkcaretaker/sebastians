// src/app/models/menu.model.ts

/**
 * Represents a single menu item
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  allergens?: string[];
  available: boolean;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very-hot';
}

/**
 * Represents a category of menu items (e.g., "Appetizers", "Main Courses")
 */
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  order: number; // For sorting categories
  isVisible: boolean;
}

/**
 * Represents the complete menu for a restaurant
 */
export interface Menu {
  id: string;
  restaurantId: string;
  name?: string; // Menu name (e.g., "Dinner Menu", "Lunch Special")
  categories: MenuCategory[];
  lastUpdated: Date;
  version: string; // For cache invalidation
  isActive: boolean;
}

/**
 * Dietary restriction filters
 */
export interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  showOnlyAvailable: boolean;
}

/**
 * Menu search and filter options
 */
export interface MenuSearchOptions {
  searchTerm?: string;
  categoryFilter?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dietaryFilters?: DietaryFilters;
}

/**
 * Menu display configuration
 */
export interface MenuDisplayConfig {
  showPrices: boolean;
  showDescriptions: boolean;
  showImages: boolean;
  showAllergens: boolean;
  showDietaryIcons: boolean;
  compactView: boolean;
}

/**
 * For Phase 1: Simple menu data for Google Docs integration
 */
export interface SimpleMenuData {
  restaurantName: string;
  menuTitle: string;
  googleDocUrl: string;
  lastUpdated: Date;
}