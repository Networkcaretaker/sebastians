// Website and publishing related types

import { ContactInfo } from './restaurant';
import { Menu } from './menu';

// Publication status for menus
export type PublishStatus = 'draft' | 'published' | 'unpublished';

// Extended Menu interface with publication fields
export interface MenuWithPublishStatus extends Menu {
  publishStatus?: PublishStatus;
  publishedAt?: Date;
  publishedUrl?: string;
  lastPublished?: Date;
}

// Interface for menu publishing information
export interface PublishedMenu {
  menuId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  order: number;
  publishedAt: Date;
  publishedUrl?: string;
  lastPublished?: Date;
}

export interface PublishMenuRequest {
  menuId: string;
  action: 'publish' | 'unpublish';
}

// Interface for website configuration
export interface WebsiteConfig {
  id?: string;
  restaurant: {
    name: string;
    description?: string;
    logo?: string;
    contactInfo: ContactInfo;
  };
  publishedMenus: PublishedMenu[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  lastUpdated: Date;
  createdAt?: Date;
}

// Interface for updating website settings
export interface UpdateWebsiteConfigDTO {
  restaurant?: {
    name?: string;
    description?: string;
    logo?: string;
    contactInfo?: Partial<ContactInfo>;
  };
  publishedMenus?: PublishedMenu[];
  theme?: Partial<WebsiteConfig['theme']>;
  seo?: Partial<WebsiteConfig['seo']>;
}

// Interface for menu publication request
export interface PublishMenuRequest {
  menuId: string;
  action: 'publish' | 'unpublish';
}

// Interface for menu publication response
export interface PublishMenuResponse {
  success: boolean;
  menuId: string;
  url?: string;
  publishedAt?: Date;
  message?: string;
  error?: string;
}

// Interface for generated menu JSON structure (what customers see)
export interface GeneratedMenu {
  metadata: {
    id: string;
    name: string;
    description: string;
    type: 'web' | 'printable';
    slug: string;
    lastUpdated: string;
    version: number;
  };
  restaurant: {
    name: string;
    description?: string;
    contactInfo: ContactInfo;
  };
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    header?: string;
    footer?: string;
    extras: Array<{
      item: string;
      price: number;
    }>;
    addons: Array<{
      item: string;
    }>;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      options: Array<{
        option: string;
        price: number;
      }>;
      extras: Array<{
        item: string;
        price: number;
      }>;
      addons: Array<{
        item: string;
      }>;
      allergies: string[];
      flags: {
        vegetarian: boolean;
        active: boolean;
      };
      order: number;
    }>;
  }>;
}