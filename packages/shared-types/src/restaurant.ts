// Restaurant-related types will be defined here
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  contactInfo?: ContactInfo;
  settings?: RestaurantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface RestaurantSettings {
  theme?: string;
  currency?: string;
  timezone?: string;
}