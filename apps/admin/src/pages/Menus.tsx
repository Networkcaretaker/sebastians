// src/pages/Menus.tsx
import React, { useState, useEffect } from 'react';
import MenuForm from '../components/MenuForm';
import MenuCard from '../components/MenuCard';
import MenuTable from '../components/MenuTable';
import CategoryManagement from '../components/CategoryManagement';
import menuService from '../services/menuService';
import { Menu, CreateMenuDTO, MenuCategory } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

// View options type
type ViewType = 'table' | 'cards';
type ColumnCount = 2 | 3;

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCategoryManagementVisible, setIsCategoryManagementVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const { currentUser } = useAuth();
  
  // View options state
  const [viewType, setViewType] = useState<ViewType>('table');
  const [columnCount, setColumnCount] = useState<ColumnCount>(3);

  useEffect(() => {
    if (currentUser) {
      console.log('Menus: User is authenticated, fetching data');
      fetchMenus();
      fetchCategories();
    } else {
      console.log('Menus: No authenticated user');
      setLoading(false);
      setError('You must be logged in to view menus');
    }
  }, [currentUser]);

  const fetchMenus = async () => {
    setError(null);
    try {
      console.log('Fetching menus...');
      const menusData = await menuService.getAllMenus();
      console.log('Successfully fetched menus:', menusData);
      setMenus(menusData);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuCategory[];
      
      console.log('Successfully fetched categories:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddMenu = async (menuData: CreateMenuDTO) => {
    setError(null);
    try {
      console.log('Adding menu with data:', menuData);
      
      // Add the menu
      const newMenu = await menuService.addMenu(menuData);
      
      setIsFormVisible(false);
      fetchMenus();
    } catch (error) {
      console.error('Error adding menu:', error);
      setError(error instanceof Error ? error.message : 'Failed to add menu');
    }
  };

  const handleUpdateMenu = async (menuData: CreateMenuDTO) => {
    if (!selectedMenu?.id) return;
    
    setError(null);
    try {
      console.log('Updating menu:', selectedMenu.id, menuData);
      
      await menuService.updateMenu(selectedMenu.id, menuData);
      
      setIsFormVisible(false);
      setSelectedMenu(null);
      fetchMenus();
    } catch (error) {
      console.error('Error updating menu:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu');
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        await menuService.deleteMenu(menuId);
        fetchMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete menu');
      }
    }
  };

  const handleToggleStatus = async (menuId: string, currentStatus: boolean) => {
    try {
      await menuService.toggleMenuStatus(menuId, !currentStatus);
      fetchMenus();
    } catch (error) {
      console.error('Error toggling menu status:', error);
    }
  };

  // Handle updating the categories in a menu
  const handleUpdateMenuCategories = async (categoryIds: string[]) => {
    if (!selectedMenu?.id) return;
    
    setError(null);
    try {
      console.log('Updating menu categories:', selectedMenu.id, categoryIds);
      
      await menuService.updateMenuCategories(selectedMenu.id, categoryIds);
      
      setIsCategoryManagementVisible(false);
      fetchMenus();
    } catch (error) {
      console.error('Error updating menu categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu categories');
    }
  };

  const handleSubmit = async (menuData: CreateMenuDTO) => {
    if (selectedMenu?.id) {
      await handleUpdateMenu(menuData);
    } else {
      await handleAddMenu(menuData);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menus</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <button
          onClick={() => {
            setSelectedMenu(null);
            setIsFormVisible(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Menu
        </button>
      </div>

      {/* View Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewType('table')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewType === 'table'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewType('cards')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                viewType === 'cards'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Card View
            </button>
          </div>
          
          {/* Column Count (only show when card view is active) */}
          {viewType === 'cards' && (
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => setColumnCount(2)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  columnCount === 2
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                2 Columns
              </button>
              <button
                onClick={() => setColumnCount(3)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  columnCount === 3
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                3 Columns
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Content based on View Type */}
      {viewType === 'table' ? (
        <MenuTable 
          menus={menus}
          categories={categories}
          onEdit={(menu) => {
            setSelectedMenu(menu);
            setIsFormVisible(true);
          }}
          onDelete={handleDeleteMenu}
          onToggleStatus={handleToggleStatus}
          onManageCategories={(menu) => {
            setSelectedMenu(menu);
            setIsCategoryManagementVisible(true);
          }}
        />
      ) : (
        <div className={`grid grid-cols-1 ${
          columnCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
        } gap-4`}>
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              categories={categories}
              onEdit={(menu) => {
                setSelectedMenu(menu);
                setIsFormVisible(true);
              }}
              onDelete={handleDeleteMenu}
              onToggleStatus={handleToggleStatus}
              onManageCategories={(menu) => {
                setSelectedMenu(menu);
                setIsCategoryManagementVisible(true);
              }}
            />
          ))}
        </div>
      )}

      {/* No menus message */}
      {menus.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No menus found. Create your first menu to get started.</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedMenu ? 'Edit Menu' : 'Create New Menu'}
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <MenuForm
              initialData={selectedMenu || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormVisible(false)}
            />
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryManagementVisible && selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Manage Categories for {selectedMenu.menu_name}
              </h2>
              <button
                onClick={() => setIsCategoryManagementVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <CategoryManagement
              menu={selectedMenu}
              categories={categories}
              onSave={handleUpdateMenuCategories}
              onClose={() => setIsCategoryManagementVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Menus;