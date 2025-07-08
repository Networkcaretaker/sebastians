// Interface for menu item options (e.g., sizes, variants)
export interface MenuItemOption {
  option: string;
  price: number;
}

// Interface for extra items that can be added
export interface MenuItemExtra {
  item: string;
  price: number;
}

// Interface for add-on items
export interface MenuItemAddon {
  item: string;
}

// Interface for item flags
export interface MenuItemFlags {
  active: boolean;
  vegetarian: boolean;
  vegan: boolean;
  spicy: boolean;
  extras: boolean;
  addons: boolean;
  options: boolean;
}

// Main menu item interface
export interface MenuItem {
  id?: string;
  item_name: string;
  item_description: string;
  category: string;
  price: number;
  options: MenuItemOption[];
  extras: MenuItemExtra[];
  addons: MenuItemAddon[];
  flags: MenuItemFlags;
  allergies: string[];
  menu_order: number;
}

// Menu categories
export interface MenuCategory {
  id?: string;
  cat_name: string;
  cat_description: string;
  extras: MenuItemExtra[];
  addons: MenuItemAddon[];
  items: string[]; // array of item IDs
  header: string;
  footer: string;
}

// Menu management interfaces
export interface Menu {
  id?: string;
  menu_name: string;
  menu_description: string;
  menu_type: 'web' | 'printable';
  categories: string[]; // array of category IDs in order
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  menu_order: number;
}

// DTO for creating menus
export type CreateMenuDTO = Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>;

// DTO for updating menus
export type UpdateMenuDTO = Partial<Menu>;

// Menu type options
export const MENU_TYPES = {
  WEB: 'web' as const,
  PRINTABLE: 'printable' as const
} as const;

export type MenuType = typeof MENU_TYPES[keyof typeof MENU_TYPES];

// Response interfaces for menu service methods
export interface ToggleMenuStatusResponse {
  id: string;
  isActive: boolean;
}

export interface UpdateMenuCategoriesResponse {
  id: string;
  categories: string[];
}

export interface MenuItemTranslation {
  id?: string;
  item_name: string;
  item_description: string;
  // Simple text translations for existing fields
  translated_options?: string[]; // Array of translated "option" text
  translated_extras?: string[];  // Array of translated "item" text for extras
  translated_addons?: string[];  // Array of translated "item" text for addons
  updatedAt?: Date;
  createdAt?: Date;
}

export interface CreateTranslationDTO {
  item_name: string;
  item_description: string;
  translated_options?: string[];
  translated_extras?: string[];
  translated_addons?: string[];
}

export interface UpdateTranslationDTO {
  item_name?: string;
  item_description?: string;
  translated_options?: string[];
  translated_extras?: string[];
  translated_addons?: string[];
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationResponse {
  success: boolean;
  message: string;
  translation?: MenuItemTranslation;
}

export interface GetTranslationsResponse {
  success: boolean;
  message: string;
  translations?: Record<string, MenuItemTranslation>;
}

// Category Translation Interfaces
export interface CategoryTranslation {
  id?: string;
  cat_name: string;
  cat_description: string;
  header: string;
  footer: string;
  // Simple text translations for existing fields
  translated_extras?: string[];  // Array of translated "item" text for extras
  translated_addons?: string[];  // Array of translated "item" text for addons
  updatedAt?: Date;
  createdAt?: Date;
}

export interface CreateCategoryTranslationDTO {
  cat_name: string;
  cat_description: string;
  header: string;
  footer: string;
  translated_extras?: string[];
  translated_addons?: string[];
}

export interface UpdateCategoryTranslationDTO {
  cat_name?: string;
  cat_description?: string;
  header?: string;
  footer?: string;
  translated_extras?: string[];
  translated_addons?: string[];
}

// Response types for category translation operations
export interface CategoryTranslationResponse {
  success: boolean;
  message: string;
  translation?: CategoryTranslation;
}

export interface GetCategoryTranslationsResponse {
  success: boolean;
  message: string;
  translations?: Record<string, CategoryTranslation>;
}