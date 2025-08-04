// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../services/firebase';

//const DEBUG = process.env.NODE_ENV === 'development';
const DEBUG = false;

export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    // Track page view
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href
    });

    // Also log a custom event for testing
    logEvent(analytics, 'menu_page_visited', {
      page_name: pageName,
      timestamp: new Date().toISOString()
    });
    
    if (DEBUG) {
      console.log(`📊 Analytics: Tracked page view for ${pageName}`);
    };
  }, [pageName]);
};