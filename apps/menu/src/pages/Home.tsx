import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedMenus, PublishedMenu } from '../services/menuService';
import { APP_CONFIG } from '../services/config';

const Home: React.FC = () => {
  const [menus, setMenus] = useState<PublishedMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        
        // Use the real service to fetch published menus
        const publishedMenus = await getPublishedMenus();
        
        setMenus(publishedMenus);
        setError(null);
      } catch (err) {
        setError('Failed to load menus. Please try again later.');
        console.error('Error loading menus:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">{APP_CONFIG.restaurantName}</h1>
            <p className="mt-2 text-gray-600">{APP_CONFIG.restaurantDescription}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menus.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🍽️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No menus available</h2>
            <p className="text-gray-600">Check back soon for our latest menu offerings!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {menu.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {menu.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(menu.lastUpdated).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/menu/${menu.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      View Menu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 {APP_CONFIG.restaurantName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;