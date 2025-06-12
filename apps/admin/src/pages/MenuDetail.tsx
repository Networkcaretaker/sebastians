// src/pages/MenuDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Menu, MenuCategory } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import MenuPreview from '../components/MenuPreview';

// View options type
type ViewType = 'details' | 'preview';

const MenuDetail: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('details');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view menu details');
      return;
    }

    if (!menuId) {
      setLoading(false);
      setError('Menu ID is missing');
      return;
    }

    const fetchMenuAndCategories = async () => {
      try {
        // Fetch the menu
        const menuDoc = await getDoc(doc(db, 'menus', menuId));
        
        if (!menuDoc.exists()) {
          setError('Menu not found');
          setLoading(false);
          return;
        }
        
        const menuData = {
          id: menuDoc.id,
          ...menuDoc.data(),
          createdAt: menuDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: menuDoc.data().updatedAt?.toDate() || new Date()
        } as Menu;
        
        setMenu(menuData);

        // Fetch all categories for reference
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuCategory[];
        
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Error fetching menu details:', err);
        setError('Failed to load menu details');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuAndCategories();
  }, [menuId, currentUser]);

  // Get category names from IDs
  const getMenuCategories = () => {
    if (!menu || !menu.categories) return [];
    
    return menu.categories.map(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      return category || { id: categoryId, cat_name: 'Unknown Category', cat_description: '' };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link 
          to="/menus" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Menus
        </Link>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Menu not found</p>
        </div>
        <Link 
          to="/menus" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Menus
        </Link>
      </div>
    );
  }

  const menuCategories = getMenuCategories();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Navigation and Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-2 md:mb-0">
          <Link 
            to="/menus" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            ← Back to Menus
          </Link>
        </div>
        
        {/* View Toggle and Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* View Type Toggle */}
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewType('details')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewType === 'details'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setViewType('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                viewType === 'preview'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => navigate('/menus')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Edit Menu
          </button>
          
          {menu.menu_type === 'web' && menuCategories.length > 0 && (
            <button
              onClick={() => setViewType('preview')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {viewType === 'preview' ? 'Currently Previewing' : 'Preview Menu'}
            </button>
          )}
        </div>
      </div>

      {/* Conditional Content based on View Type */}
      {viewType === 'preview' ? (
        // Menu Preview View
        <div>
          {menuCategories.length > 0 ? (
            <MenuPreview menu={menu} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                <p className="text-gray-500 mb-4">
                  This menu has no categories assigned. Add categories to see the preview.
                </p>
                <Link 
                  to="/menus"
                  className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Manage Categories
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Menu Details View (Original Content)
        <div>
          {/* Menu Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{menu.menu_name}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    menu.menu_type === 'web' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {menu.menu_type === 'web' ? 'Web Menu' : 'Printable Menu'}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    menu.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {menu.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Order: {menu.menu_order}</p>
                <p>Created: {menu.createdAt.toLocaleDateString()}</p>
                <p>Updated: {menu.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
            
            {menu.menu_description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{menu.menu_description}</p>
              </div>
            )}

            {/* Categories Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Categories ({menuCategories.length})
                </h3>
                <Link 
                  to="/menus"
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  Manage Categories
                </Link>
              </div>
              
              {menuCategories.length > 0 ? (
                <div className="space-y-3">
                  {menuCategories.map((category, index) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between bg-gray-50 p-4 rounded border"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{category.cat_name}</h4>
                          {category.cat_description && (
                            <p className="text-sm text-gray-600">{category.cat_description}</p>
                          )}
                        </div>
                      </div>
                      <Link 
                        to={`/categories/${category.id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        View Category
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded text-center">
                  <p className="text-gray-500 mb-2">No categories assigned to this menu</p>
                  <Link 
                    to="/menus"
                    className="inline-flex items-center text-blue-500 hover:text-blue-700"
                  >
                    Add categories to this menu →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Menu Structure Preview (Future Feature) */}
          {menu.menu_type === 'web' && menuCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Menu Structure Preview</h3>
                <button
                  onClick={() => setViewType('preview')}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  View Full Preview
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-3">
                  This is how your menu categories will be ordered:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  {menuCategories.map((category, index) => (
                    <li key={category.id} className="text-sm">
                      <span className="font-medium">{category.cat_name}</span>
                      {category.cat_description && (
                        <span className="text-gray-600"> - {category.cat_description}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuDetail;