// src/app/services/menu.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, retry, timeout } from 'rxjs/operators';

// Import our models
import { 
  Menu as MenuModel, 
  MenuItem, 
  MenuCategory, 
  SimpleMenuData,
  MenuSearchOptions,
  MenuDisplayConfig 
} from '../models/menu.model';
import { LoadingState, AppError } from '../models/app.model';

@Injectable({
  providedIn: 'root'
})
export class Menu {
  
  // State management using BehaviorSubjects
  private currentMenuSubject = new BehaviorSubject<MenuModel | null>(null);
  private loadingStateSubject = new BehaviorSubject<LoadingState>('idle');
  private errorSubject = new BehaviorSubject<AppError | null>(null);
  private menuDisplayConfigSubject = new BehaviorSubject<MenuDisplayConfig>({
    showPrices: true,
    showDescriptions: true,
    showImages: true,
    showAllergens: false,
    showDietaryIcons: true,
    compactView: false
  });

  // Public observables for components to subscribe to
  public currentMenu$ = this.currentMenuSubject.asObservable();
  public loadingState$ = this.loadingStateSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public menuDisplayConfig$ = this.menuDisplayConfigSubject.asObservable();

  // Cache for performance (important for QR code users)
  private menuCache = new Map<string, { data: MenuModel, timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  /**
   * Phase 1: Load menu from Google Docs
   * This is the main method for Phase 1 implementation
   */
  loadMenuFromGoogleDocs(restaurantId: string, googleDocUrl: string): Observable<SimpleMenuData> {
    this.setLoadingState('loading');
    this.clearError();

    // Check cache first for better performance
    const cached = this.getCachedMenu(restaurantId);
    if (cached) {
      console.log('Loading menu from cache');
      return of(this.convertCacheToSimpleData(cached, googleDocUrl));
    }

    // Validate Google Docs URL
    if (!this.isValidGoogleDocUrl(googleDocUrl)) {
      const error: AppError = {
        code: 'INVALID_URL',
        message: 'Invalid Google Docs URL provided',
        details: { url: googleDocUrl },
        timestamp: new Date()
      };
      this.setError(error);
      return throwError(() => error);
    }

    // For Phase 1, we'll work with the embedded Google Doc
    // In a real implementation, you might extract data from the doc
    const simpleMenuData: SimpleMenuData = {
      restaurantName: `Restaurant ${restaurantId}`,
      menuTitle: 'Current Menu',
      googleDocUrl: googleDocUrl,
      lastUpdated: new Date()
    };

    this.setLoadingState('success');
    return of(simpleMenuData);
  }

  /**
   * Validate if the Google Docs URL is properly formatted
   */
  private isValidGoogleDocUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    // Check for Google Docs URL patterns
    const googleDocPatterns = [
      /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/
    ];

    return googleDocPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Get embedded Google Docs URL for iframe
   */
  getEmbeddedGoogleDocUrl(originalUrl: string): string {
    // Convert regular Google Docs URL to embedded version
    if (originalUrl.includes('/edit')) {
      return originalUrl.replace('/edit', '/pub?embedded=true');
    }
    
    if (originalUrl.includes('/view')) {
      return originalUrl.replace('/view', '/pub?embedded=true');
    }

    // If already embedded URL, return as is
    if (originalUrl.includes('embedded=true')) {
      return originalUrl;
    }

    // Try to construct embedded URL
    const docIdMatch = originalUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (docIdMatch) {
      const docId = docIdMatch[1];
      return `https://docs.google.com/document/d/${docId}/pub?embedded=true`;
    }

    return originalUrl;
  }

  /**
   * Cache management for better performance
   */
  private getCachedMenu(restaurantId: string): MenuModel | null {
    const cached = this.menuCache.get(restaurantId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedMenu(restaurantId: string, menu: MenuModel): void {
    this.menuCache.set(restaurantId, {
      data: menu,
      timestamp: Date.now()
    });
  }

  private convertCacheToSimpleData(menu: MenuModel, googleDocUrl: string): SimpleMenuData {
    return {
      restaurantName: `Restaurant ${menu.restaurantId}`,
      menuTitle: menu.name || 'Current Menu',
      googleDocUrl: googleDocUrl,
      lastUpdated: menu.lastUpdated
    };
  }

  /**
   * Search and filter functionality (for future phases)
   */
  searchMenuItems(searchOptions: MenuSearchOptions): Observable<MenuItem[]> {
    const currentMenu = this.currentMenuSubject.value;
    if (!currentMenu) {
      return of([]);
    }

    let items: MenuItem[] = [];
    
    // Flatten all items from all categories
    currentMenu.categories.forEach(category => {
      items = items.concat(category.items);
    });

    // Apply search term filter
    if (searchOptions.searchTerm) {
      const searchTerm = searchOptions.searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (searchOptions.categoryFilter) {
      items = items.filter(item => item.category === searchOptions.categoryFilter);
    }

    // Apply dietary filters
    if (searchOptions.dietaryFilters) {
      const filters = searchOptions.dietaryFilters;
      items = items.filter(item => {
        if (filters.vegetarian && !item.isVegetarian) return false;
        if (filters.vegan && !item.isVegan) return false;
        if (filters.glutenFree && !item.isGlutenFree) return false;
        if (filters.showOnlyAvailable && !item.available) return false;
        return true;
      });
    }

    // Apply price range filter
    if (searchOptions.priceRange) {
      const { min, max } = searchOptions.priceRange;
      items = items.filter(item => item.price >= min && item.price <= max);
    }

    return of(items);
  }

  /**
   * Update menu display configuration
   */
  updateDisplayConfig(config: Partial<MenuDisplayConfig>): void {
    const currentConfig = this.menuDisplayConfigSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.menuDisplayConfigSubject.next(newConfig);
  }

  /**
   * Get current menu display configuration
   */
  getDisplayConfig(): MenuDisplayConfig {
    return this.menuDisplayConfigSubject.value;
  }

  /**
   * Force refresh menu (bypass cache)
   */
  refreshMenu(restaurantId: string, googleDocUrl: string): Observable<SimpleMenuData> {
    // Clear cache for this restaurant
    this.menuCache.delete(restaurantId);
    return this.loadMenuFromGoogleDocs(restaurantId, googleDocUrl);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.menuCache.clear();
  }

  /**
   * State management helpers
   */
  private setLoadingState(state: LoadingState): void {
    this.loadingStateSubject.next(state);
  }

  private setError(error: AppError): void {
    this.errorSubject.next(error);
    this.setLoadingState('error');
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get current loading state
   */
  getLoadingState(): LoadingState {
    return this.loadingStateSubject.value;
  }

  /**
   * Check if service is currently loading
   */
  isLoading(): boolean {
    return this.loadingStateSubject.value === 'loading';
  }

  /**
   * Phase 2 preparation: Methods for custom CMS (future implementation)
   */
  
  // These methods will be implemented in Phase 2
  loadMenuFromFirestore(restaurantId: string): Observable<MenuModel> {
    // TODO: Implement Firestore integration in Phase 2
    throw new Error('Not implemented yet - Phase 2 feature');
  }

  saveMenuToFirestore(menu: MenuModel): Observable<void> {
    // TODO: Implement Firestore saving in Phase 2
    throw new Error('Not implemented yet - Phase 2 feature');
  }

  /**
   * Cleanup method
   */
  ngOnDestroy(): void {
    this.currentMenuSubject.complete();
    this.loadingStateSubject.complete();
    this.errorSubject.complete();
    this.menuDisplayConfigSubject.complete();
  }
}