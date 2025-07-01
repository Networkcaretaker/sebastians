// src/pages/Categories.tsx
import React, { useState, useEffect } from 'react';
import CategoryForm from '../components/CategoryForm';
import CategoryCard from '../components/CategoryCard';
import CategoryTable from '../components/CategoryTable';
import ItemsManagement from '../components/ItemsManagement';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';

// View options type
type ViewType = 'table' | 'cards';
type ColumnCount = 2 | 3;

const COLLECTION_NAME = 'categories';


const Categories: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isItemsManagementVisible, setIsItemsManagementVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { currentUser } = useAuth();

  const activeMenuItems = menuItems.filter(item => item.flags && item.flags.active);
  
  // View options state
  const [viewType, setViewType] = useState<ViewType>('table');
  const [columnCount, setColumnCount] = useState<ColumnCount>(3);

  useEffect(() => {
    if (currentUser) {
      console.log('Categories: User is authenticated, fetching data');
      fetchCategories();
      fetchMenuItems();
    } else {
      console.log('Categories: No authenticated user');
      setLoading(false);
      setError('You must be logged in to view categories');
    }
  }, [currentUser]);
  
  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items...');
      const querySnapshot = await getDocs(collection(db, 'menu_items'));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    setError(null);
    try {
      console.log('Fetching categories...');
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuCategory[];
      
      console.log('Successfully fetched categories:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: MenuCategory) => {
    setError(null);
    try {
      console.log('Adding category with data:', categoryData);
      // Make sure items array exists
      const dataToAdd = {
        ...categoryData,
        items: categoryData.items || []
      };
      
      const categoryCollection = collection(db, COLLECTION_NAME);
      await addDoc(categoryCollection, dataToAdd);
      setIsFormVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      setError(error instanceof Error ? error.message : 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (categoryData: MenuCategory) => {
    if (!selectedCategory?.id) return;
    
    setError(null);
    try {
      console.log('Updating category:', selectedCategory.id, categoryData);
      const categoryRef = doc(db, COLLECTION_NAME, selectedCategory.id);
      
      // Convert to a plain object with flattened fields
      const updateData = {
        cat_name: categoryData.cat_name,
        cat_description: categoryData.cat_description,
        extras: categoryData.extras,
        addons: categoryData.addons,
        header: categoryData.header,
        footer: categoryData.footer,
        items: categoryData.items || []
      };
      
      await updateDoc(categoryRef, updateData);
      setIsFormVisible(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // Get the category to find its items
        const category = categories.find(cat => cat.id === categoryId);
        
        // Update any menu items that were in this category
        if (category && category.items && category.items.length > 0) {
          for (const itemId of category.items) {
            const itemRef = doc(db, 'menu_items', itemId);
            await updateDoc(itemRef, {
              category: ""
            });
          }
        }
        
        // Delete the category
        await deleteDoc(doc(db, COLLECTION_NAME, categoryId));
        fetchCategories();
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete category');
      }
    }
  };

  // Handle updating the items in a category
  const handleUpdateCategoryItems = async (itemIds: string[]) => {
    if (!selectedCategory?.id) return;
    
    setError(null);
    try {
      console.log('Updating category items:', selectedCategory.id, itemIds);
      const categoryRef = doc(db, COLLECTION_NAME, selectedCategory.id);
      
      await updateDoc(categoryRef, {
        items: itemIds
      });
      
      // Also update menu items to have this category
      for (const item of menuItems) {
        if (item.id) {
          const itemRef = doc(db, 'menu_items', item.id);
          
          if (itemIds.includes(item.id)) {
            // Item should be in this category
            if (item.category !== selectedCategory.id) {
              await updateDoc(itemRef, {
                category: selectedCategory.id
              });
            }
          } else if (item.category === selectedCategory.id) {
            // Item should not be in this category anymore
            await updateDoc(itemRef, {
              category: ""
            });
          }
        }
      }
      
      setIsItemsManagementVisible(false);
      fetchCategories();
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating category items:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category items');
    }
  };

  const handleSubmit = async (categoryData: MenuCategory) => {
    if (selectedCategory?.id) {
      await handleUpdateCategory(categoryData);
    } else {
      await handleAddCategory(categoryData);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Categories</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsFormVisible(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Category
        </button>
      </div>

      {/* View Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
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
        <CategoryTable 
          categories={categories}
          menuItems={activeMenuItems}
          onEdit={(category) => {
            setSelectedCategory(category);
            setIsFormVisible(true);
          }}
          onDelete={handleDeleteCategory}
          onManageItems={(category) => {
            setSelectedCategory(category);
            setIsItemsManagementVisible(true);
          }}
        />
      ) : (
        <div className={`grid grid-cols-1 ${
          columnCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
        } gap-4`}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              menuItems={menuItems}
              onEdit={() => {
                setSelectedCategory(category);
                setIsFormVisible(true);
              }}
              onDelete={() => handleDeleteCategory(category.id!)}
              onManageItems={() => {
                setSelectedCategory(category);
                setIsItemsManagementVisible(true);
              }}
            />
          ))}
        </div>
      )}

      {/* No categories message */}
      {categories.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No categories found. Add your first category to get started.</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <CategoryForm
              initialData={selectedCategory || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormVisible(false)}
            />
          </div>
        </div>
      )}

      {/* Items Management Modal */}
      {isItemsManagementVisible && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Manage Items for {selectedCategory.cat_name}
              </h2>
              <button
                onClick={() => setIsItemsManagementVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ItemsManagement
              category={selectedCategory}
              onSave={handleUpdateCategoryItems}
              onClose={() => setIsItemsManagementVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;