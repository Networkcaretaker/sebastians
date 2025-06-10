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