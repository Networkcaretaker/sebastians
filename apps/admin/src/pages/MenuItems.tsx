// src/pages/MenuItems.tsx
import React, { useState, useEffect } from 'react';
import ItemForm from '../components/ItemForm';
import ItemCard from '../components/ItemCard';
import ItemTable from '../components/ItemTable';
import menuItemService from '../services/menuItemService';
import { MenuItem, CreateMenuItemDTO, MenuCategory } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// View options type
type ViewType = 'table' | 'cards';
type ColumnCount = 2 | 3;

const MenuItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const { currentUser } = useAuth();
  
  // View options state
  const [viewType, setViewType] = useState<ViewType>('table');
  const [columnCount, setColumnCount] = useState<ColumnCount>(3);

  useEffect(() => {
    if (currentUser) {
      console.log('MenuItems: User is authenticated, fetching data');
      fetchMenuItems();
      fetchCategories();
    } else {
      console.log('MenuItems: No authenticated user');
      setLoading(false);
      setError('You must be logged in to view menu items');
    }
  }, [currentUser]);

  const fetchMenuItems = async () => {
    setError(null);
    try {
      console.log('Fetching menu items...');
      const items = await menuItemService.getAllMenuItems();
      console.log('Successfully fetched items:', items);
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
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

  const handleAddItem = async (itemData: CreateMenuItemDTO) => {
    setError(null);
    try {
      console.log('Adding menu item with data:', itemData);
      // Make sure the flags are properly initialized
      const sanitizedData = {
        ...itemData,
        flags: {
          active: itemData.flags?.active ?? true,
          vegetarian: itemData.flags?.vegetarian ?? false,
          extras: Boolean(itemData.extras?.length),
          addons: Boolean(itemData.addons?.length),
          options: Boolean(itemData.options?.length)
        }
      };
      
      // Add the menu item
      const newItem = await menuItemService.addMenuItem(sanitizedData);
      
      // If category is selected, update the category's items array
      if (itemData.category) {
        await updateCategoryItems(itemData.category, newItem.id!, true);
      }
      
      setIsFormVisible(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add menu item');
    }
  };

  const handleUpdateItem = async (itemData: CreateMenuItemDTO) => {
    if (!selectedItem?.id) return;
    
    try {
      // Get the previous category if there was one
      const previousCategory = selectedItem.category;
      const newCategory = itemData.category;
      
      // Update the menu item first
      await menuItemService.updateMenuItem(selectedItem.id, itemData);
      
      // Handle category changes if needed
      if (previousCategory !== newCategory) {
        // Remove from previous category if it exists
        if (previousCategory) {
          await updateCategoryItems(previousCategory, selectedItem.id, false);
        }
        
        // Add to new category if selected
        if (newCategory) {
          await updateCategoryItems(newCategory, selectedItem.id, true);
        }
      }
      
      setIsFormVisible(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu item');
    }
  };

  // Helper function to update a category's items array
  const updateCategoryItems = async (categoryId: string, itemId: string, isAdding: boolean) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      
      if (isAdding) {
        // Add item to category's items array
        await updateDoc(categoryRef, {
          items: arrayUnion(itemId)
        });
      } else {
        // Remove item from category's items array
        await updateDoc(categoryRef, {
          items: arrayRemove(itemId)
        });
      }
    } catch (error) {
      console.error('Error updating category items:', error);
      throw error;
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      await menuItemService.toggleItemStatus(itemId, !currentStatus);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling item status:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Find the item to get its category
        const item = menuItems.find(item => item.id === itemId);
        
        // Delete the menu item
        await menuItemService.deleteMenuItem(itemId);
        
        // If item was in a category, remove it from the category's items array
        if (item && item.category) {
          await updateCategoryItems(item.category, itemId, false);
        }
        
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  // Get unique categories for the filter
  const uniqueCategories = ['all', ...new Set(menuItems.map(item => {
    // Find the category name based on ID
    const category = categories.find(cat => cat.id === item.category);
    return category ? category.cat_name : item.category;
  }).filter(Boolean))];
  
  // Filter items by selected category
  const filteredItems = currentCategory === 'all'
    ? menuItems
    : menuItems.filter(item => {
        const category = categories.find(cat => cat.id === item.category);
        return category ? category.cat_name === currentCategory : item.category === currentCategory;
      });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Items</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsFormVisible(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Item
        </button>
      </div>

      {/* View Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {uniqueCategories.map(category => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                currentCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* View Options */}
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
        <ItemTable 
          items={filteredItems}
          categories={categories}
          onEdit={(item) => {
            setSelectedItem(item);
            setIsFormVisible(true);
          }}
          onDelete={handleDeleteItem}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className={`grid grid-cols-1 ${
          columnCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
        } gap-4`}>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              categories={categories}
              onEdit={(item) => {
                setSelectedItem(item);
                setIsFormVisible(true);
              }}
              onDelete={handleDeleteItem}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* No items message */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No menu items found in this category.</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ItemForm
              onSubmit={selectedItem ? handleUpdateItem : handleAddItem}
              initialData={selectedItem || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;