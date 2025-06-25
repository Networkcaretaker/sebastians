// apps/menu/src/pages/MenuDisplay.tsx
// Keep all your existing imports and logic, just replace the main content section

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuData, MenuData } from '../services/menuService';
import { APP_CONFIG } from '../services/config';
import MenuPreview from '../components/MenuPreview'; // Add this import

const MenuDisplay: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      if (!menuId) {
        setError('No menu ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use the real service to fetch menu data
        const fetchedMenuData = await getMenuData(menuId);
        
        if (!fetchedMenuData) {
          setError(APP_CONFIG.errorMessages.menuNotFound);
          return;
        }

        setMenuData(fetchedMenuData);
        setError(null);
      } catch (err) {
        setError(APP_CONFIG.errorMessages.networkError);
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [menuId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Menu not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested menu could not be found.'}</p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <img src="/Sebastian_Logo.png" className="w-40" alt="Sebastian's Logo" />
            <Link
              to="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span className="mr-2">←</span>
              Back to Menus
            </Link>
          </div>
        </div>
      </header>

      {/* Replace the entire main section with MenuPreview component */}
      <main className="pb-8">
        <MenuPreview menuData={menuData} />
      </main>
    </div>
  );
};

export default MenuDisplay;