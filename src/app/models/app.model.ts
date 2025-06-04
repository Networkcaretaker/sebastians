// src/app/models/app.model.ts

/**
 * Application loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Error information
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Application state for Phase 1
 */
export interface AppState {
  isLoading: boolean;
  loadingState: LoadingState;
  error?: AppError;
  
  // Current restaurant and menu data
  currentRestaurant?: any; // Will use Restaurant model
  currentMenu?: any; // Will use Menu model
  
  // UI state
  selectedCategory?: string;
  searchTerm?: string;
  showSearch: boolean;
  
  // Device and connection info
  isOnline: boolean;
  isMobile: boolean;
  deviceInfo?: DeviceInfo;
}

/**
 * Device information for optimization
 */
export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  connectionType?: string;
}

/**
 * Navigation/routing related models
 */
export interface RouteParams {
  restaurantId?: string;
  menuId?: string;
  categoryId?: string;
}

/**
 * Configuration for different app environments
 */
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl?: string;
  googleDocsBaseUrl: string;
  enableAnalytics: boolean;
  enableOfflineMode: boolean;
  cacheTimeout: number; // minutes
  maxRetries: number;
}

/**
 * Analytics event for tracking user behavior
 */
export interface AnalyticsEvent {
  eventType: 'page_view' | 'menu_item_view' | 'category_select' | 'search' | 'error';
  data?: any;
  timestamp: Date;
  sessionId: string;
}

/**
 * Toast/notification message
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number; // milliseconds
  autoClose?: boolean;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  menuLoadTime: number;
  errorCount: number;
  timestamp: Date;
}