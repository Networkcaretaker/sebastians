// apps/menu/src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedMenus } from '../services/menuService';
import MenuFooter from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { usePageTracking } from '../hooks/usePageTracking';
import { APP_CONFIG, THEME_CONFIG } from '../services/config';

interface PublishedMenu {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  url: string;
  translations?: Record<string, any>;
  image?: string;
}

const Home: React.FC = () => {
  const { t, getMenuName, getMenuDescription } = useTranslation();
  const [menus, setMenus] = useState<PublishedMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTracking('HomePage');

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const publishedMenus = await getPublishedMenus();
        setMenus(publishedMenus);
      } catch (err) {
        console.error('Error fetching menus:', err);
        setError('Failed to load menus. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">{t('loadingMenus')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME_CONFIG.background}`}>
      {/* Enhanced Header */}
      <header className={`${THEME_CONFIG.themeColor} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center p-4">
               <img src={`${THEME_CONFIG.logo.dark}`} alt={`${APP_CONFIG.restaurantName}`} className="pb-2 min-w-72"></img>
            </div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              {t('welcomeMessage')}
            </p>
            <div className="justify-center flex pt-6">
              <LanguageSelector 
                variant="buttons" 
                showFlags={true}
                className="font-bold"
              />
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-500 text-2xl mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-red-800">{t('errorLoadingMenus')}</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {menus.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-6">🍽️</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">{t('noMenusAvailable')}</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {t('menuUpdatingMessage')}
            </p>
          </div>
        ) : (
          <div>
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-white mb-4">{t('ourMenus')}</h2>
              <div className="w-24 h-1 bg-gradient-to-tr from-amber-400 to-amber-600 mx-auto"></div>
            </div>

            {/* Menu Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className={`${THEME_CONFIG.themeColor} px-6 py-4`}>
                    <h3 className="text-xl text-center font-bold text-black">
                      {getMenuName(menu)}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-2 space-y-2">
                    <Link
                      to={`/menu/${menu.id}`}
                    >
                      <img src={`${menu.image}`} alt={`${menu.name}`}></img>
                    </Link>
                    <h3 className="text-lg text-center font-light text-black">
                      {getMenuDescription(menu)}
                    </h3>

                  </div>

                  {/* Card Footer */}
                  <div className={`${THEME_CONFIG.themeColor} px-6 py-4`}>
                    <div className="flex items-center">
                      <Link
                        to={`/menu/${menu.id}`}
                        className={`${THEME_CONFIG.button.color} ${THEME_CONFIG.button.hover} text-white w-full text-center py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg`}
                      >
                        {t('viewMenu')}
                      </Link>
                    </div>
                    
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer>
        <MenuFooter />
      </footer>
    </div>
  );
};

export default Home;