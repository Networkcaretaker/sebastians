// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import ItemForm from './ItemForm';
import menuItemService from '../services/menuItemService';
import { MenuItem, CreateMenuItemDTO, MenuCategory } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';


const Dashboard: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('Dashboard: User is authenticated, fetching data');
      fetchMenuItems();
      fetchCategories();
    } else {
      console.log('Dashboard: No authenticated user');
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
  }))];
  
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
        <h1 className="text-3xl font-bold">Menu Dashboard</h1>
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

      {/* Category Filter */}
      <div className="mb-6">
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
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          // Find the category for this item
          const itemCategory = categories.find(cat => cat.id === item.category);
          
          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{item.item_name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(item.id!, item.flags.active)}
                      className={`px-2 py-1 rounded text-sm ${
                        item.flags.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.flags.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{item.item_description}</p>
                <p className="text-green-600 font-semibold mb-2">${item.price}</p>
                
                {/* Show category if available */}
                {itemCategory && (
                  <p className="text-blue-600 text-sm mb-2">
                    Category: {itemCategory.cat_name}
                  </p>
                )}
                
                {/* Item Details */}
                <div className="space-y-2">


                {item.options.length > 0 && (
                  <div>
                    <p className="font-medium">Options:</p>
                    <div className="text-sm text-gray-600">
                      {item.options.map((opt, idx) => (
                        <div key={idx}>
                          {opt.option}: ${opt.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.extras.length > 0 && (
                  <div>
                    <p className="font-medium">Extras:</p>
                    <div className="text-sm text-gray-600">
                      {item.extras.map((extra, idx) => (
                        <div key={idx}>
                          {extra.item}: ${extra.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.allergies.length > 0 && (
                  <div>
                    <p className="font-medium">Allergies:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsFormVisible(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id!)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
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

export default Dashboard;