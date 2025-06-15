import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuData, MenuData } from '../services/menuService';
import { APP_CONFIG } from '../services/config';

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
            <Link
              to="/"
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <span className="mr-2">←</span>
              Back to Menus
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{menuData.menu_name}</h1>
              {menuData.menu_description && (
                <p className="text-gray-600 text-sm">{menuData.menu_description}</p>
              )}
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {menuData.categories
            .sort((a, b) => a.cat_order - b.cat_order)
            .map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Category Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.cat_name}
                  </h2>
                  {category.cat_description && (
                    <p className="text-gray-600">{category.cat_description}</p>
                  )}
                  {category.cat_header && (
                    <div className="mt-2 text-sm text-gray-700 italic">
                      {category.cat_header}
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {category.items
                    .filter(item => item.isActive)
                    .sort((a, b) => a.item_order - b.item_order)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.item_name}
                          </h3>
                          {item.item_description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {item.item_description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="text-green-600 font-semibold">
                            ${item.item_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Category Extras */}
                {category.extras && category.extras.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.cat_name} Extras
                    </h3>
                    <div className="space-y-2">
                      {category.extras.map((extra, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-700">{extra.item}</span>
                          <span className="text-green-600 font-medium">
                            ${extra.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Add-ons */}
                {category.addons && category.addons.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Available Add-ons
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.addons.map((addon, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {addon.item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Footer */}
                {category.cat_footer && (
                  <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-gray-600 italic">{category.cat_footer}</p>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Menu Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>Last updated: {new Date(menuData.lastUpdated).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
};

export default MenuDisplay;