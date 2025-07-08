// Import shared types from the shared package
import {
  MenuItem,
  MenuCategory,
  MenuItemOption,
  MenuItemExtra,
  MenuItemAddon,
  MenuItemFlags,
  Menu,
  CreateMenuDTO,
  UpdateMenuDTO,
  MenuType,
  MENU_TYPES,
  ToggleMenuStatusResponse,
  UpdateMenuCategoriesResponse,
  // Website-related types
  WebsiteConfig,
  UpdateWebsiteConfigDTO,
  PublishMenuRequest,
  PublishMenuResponse,
  PublishedMenu,
  PublishStatus,
  GeneratedMenu,
  // Translations
  MenuItemTranslation,
  CreateTranslationDTO,
  UpdateTranslationDTO,
  TranslationResponse,
  GetTranslationsResponse,
  Language,
  CategoryTranslation,
  CreateCategoryTranslationDTO,
  UpdateCategoryTranslationDTO,
  CategoryTranslationResponse,
  GetCategoryTranslationsResponse
} from '@sebastians/shared-types';

// Re-export shared types for convenience
export type {
  MenuItem,
  MenuCategory,
  MenuItemOption,
  MenuItemExtra,
  MenuItemAddon,
  MenuItemFlags,
  Menu,
  CreateMenuDTO,
  UpdateMenuDTO,
  MenuType,
  ToggleMenuStatusResponse,
  UpdateMenuCategoriesResponse,
  // Website-related types
  WebsiteConfig,
  UpdateWebsiteConfigDTO,
  PublishMenuRequest,
  PublishMenuResponse,
  PublishedMenu,
  PublishStatus,
  GeneratedMenu,
  // Translations
  MenuItemTranslation,
  CreateTranslationDTO,
  UpdateTranslationDTO,
  TranslationResponse,
  GetTranslationsResponse,
  Language,
  // Category Translations
  CategoryTranslation,
  CreateCategoryTranslationDTO,
  UpdateCategoryTranslationDTO,
  CategoryTranslationResponse,
  GetCategoryTranslationsResponse
};

export { MENU_TYPES };

// Admin-specific types below

// Interface for creating a new menu item (optional id)
export type CreateMenuItemDTO = Omit<MenuItem, 'id'>;

// Interface for updating a menu item (all fields optional)
export type UpdateMenuItemDTO = Partial<MenuItem>;

// Response interfaces for different service methods
export interface ToggleStatusResponse {
  id: string;
  isActive: boolean;
}

export interface UpdateExtrasResponse {
  id: string;
  extras: MenuItemExtra[];
}

export interface UpdateOptionsResponse {
  id: string;
  options: MenuItemOption[];
}

export interface UpdateAllergiesResponse {
  id: string;
  allergies: string[];
}
