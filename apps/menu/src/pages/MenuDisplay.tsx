// apps/menu/src/pages/MenuDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuData } from '../services/menuService';
import { MenuData } from "../types/menu.types"
import { APP_CONFIG, THEME_CONFIG } from '../services/config';
import MenuPreview from '../components/MenuPreview';
import MenuFooter from '../components/Footer';
import Allergies from '../components/Allergies';
import MenuNavigation from '../components/MenuNavigation';
import { useAllergyVisibility } from '../contexts/AllergyVisibilityContext';

const MenuDisplay: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { allergiesVisible } = useAllergyVisibility();

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
      <div className="min-h-screen flex bg-black items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-amber-400 mx-auto">
          </div>
          <p className="mt-4 text-white">Loading menu...</p>
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
    <div className="min-h-screen bg-black">
      {/* Header with back button and language selector */}
      <header className={`${THEME_CONFIG.themeColor} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-4">
          <div className="py-4 flex items-center justify-between">
            <Link
              to="/"
            >
              <img src="/Sebastian_Logo.png" className="w-40 pt-2" alt="Sebastian's Logo" />
            </Link>
            
            {/* Right side with language selector and back button */}
            <div className="flex items-center gap-3">
              <MenuNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Replace the entire main section with MenuPreview component */}
      <main className="pb-4">
        <MenuPreview menuData={menuData} />
        {allergiesVisible && (<Allergies />)}
      </main>
      <footer>
        <MenuFooter />
      </footer>
    </div>
  );
};

export default MenuDisplay;