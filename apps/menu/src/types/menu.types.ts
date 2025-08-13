import { MenuImage } from '@sebastians/shared-types';

export interface MenuItem {
  id: string;
  item_name: string;
  item_description?: string;
  item_price: number;
  item_order: number;
  isActive: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: boolean;
  allergies: string[];   
  options?: Array<{ option: string; price: number }>;
  extras?: Array<{ item: string; price: number }>;
  addons?: Array<{ item: string }>;
  hasOptions?: boolean;
  translations?: Record<string, any>;
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
  translations?: Record<string, any>;
  image: MenuImage;
}

export interface MenuData {
  id: string;
  menu_name: string;
  menu_description: string;
  menu_type: 'web' | 'printable';
  categories: MenuCategory[];
  lastUpdated: string;
  publishedUrl?: string;
  translations?: Record<string, any>;
  image: MenuImage;
}

export interface PublishedMenu {
  id: string;
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
  slug?: string;
  translations?: Record<string, any>;
  image?: string;
}