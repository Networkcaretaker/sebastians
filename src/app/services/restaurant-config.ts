// src/app/models/restaurant.model.ts

/**
 * Contact information for the restaurant
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

/**
 * Time range for operating hours
 */
export interface TimeRange {
  open: string; // Format: "HH:MM" (24-hour)
  close: string; // Format: "HH:MM" (24-hour)
  isClosed?: boolean;
}

/**
 * Special hours for holidays or events
 */
export interface SpecialHours {
  date: Date;
  hours?: TimeRange;
  isClosed: boolean;
  note?: string; // e.g., "Holiday Hours", "Private Event"
}

/**
 * Restaurant operating hours
 */
export interface OperatingHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  specialHours?: SpecialHours[];
}

/**
 * Visual styling configuration for the restaurant
 */
export interface RestaurantStyling {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * QR Code specific configuration
 */
export interface QRCodeSettings {
  landingPageMessage?: string;
  showWelcomeMessage: boolean;
  showOperatingHours: boolean;
  showContactInfo: boolean;
  autoRefreshInterval?: number; // minutes
  offlineMessage?: string;
}

/**
 * Main restaurant configuration interface
 */
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  contactInfo?: ContactInfo;
  operatingHours?: OperatingHours;
  styling?: RestaurantStyling;
  
  // Phase 1: Google Docs integration
  googleDocUrl?: string;
  
  // Phase 2: Custom CMS fields (for future)
  menuIds?: string[];
  
  // Configuration
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // QR Code specific settings
  qrCodeSettings?: QRCodeSettings;
}

/**
 * Restaurant status (for real-time updates)
 */
export interface RestaurantStatus {
  isOpen: boolean;
  currentMessage?: string; // "We're busy tonight!" or "Happy Hour until 6pm!"
  estimatedWaitTime?: number; // minutes
  lastUpdated: Date;
}

/**
 * For Phase 1: Simplified restaurant data
 */
export interface SimpleRestaurantData {
  id: string;
  name: string;
  logoUrl?: string;
  googleDocUrl: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactPhone?: string;
  isActive: boolean;
}