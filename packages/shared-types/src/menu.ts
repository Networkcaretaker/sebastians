// Menu-related types will be defined here
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}