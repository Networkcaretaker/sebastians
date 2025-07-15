// In your app: hooks/useAnalytics.ts
import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from '../services/firebase';

export const useAnalytics = () => {
  const trackMenuItemView = (itemName: string, category: string) => {
    logEvent(analytics, 'menu_item_viewed', {
      item_name: itemName,
      item_category: category
    });
  };

  const trackLanguageChange = (language: string) => {
    logEvent(analytics, 'language_changed', {
      language: language
    });
    setUserProperties(analytics, {
      preferred_language: language
    });
  };

  return {
    trackMenuItemView,
    trackLanguageChange,
    // ... more tracking functions
  };
};