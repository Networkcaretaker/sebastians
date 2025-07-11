// apps/menu/src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedMenus } from '../services/menuService';
import MenuFooter from '../components/Footer';
import LanguageSelector from '../components/LanguageSelector';

interface PublishedMenu {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  url: string;
}

const Home: React.FC = () => {
  const [menus, setMenus] = useState<PublishedMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center p-4">
               <img src="/Sebastian_Logo.png"></img>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Welcome to our restaurant! Browse our delicious menu offerings below.
            </p>
            <div className="justify-center flex pt-6">
              <LanguageSelector 
                variant="buttons" 
                showFlags={true}
                className=""
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
                <h3 className="text-lg font-medium text-red-800">Error Loading Menus</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {menus.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-6">🍽️</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">No Menus Available</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We're currently updating our menu offerings. Please check back soon for our latest delicious options!
            </p>
          </div>
        ) : (
          <div>
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Menus</h2>
              <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
            </div>

            {/* Menu Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h3 className="text-xl text-center font-bold text-white">
                      {menu.name}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center">
                      <Link
                        to={`/menu/${menu.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white w-full text-center py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        View Menu
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