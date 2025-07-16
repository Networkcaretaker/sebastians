// src/components/Categories.tsx with item management
import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItemExtra, MenuItemAddon, MenuItem } from '../types/menu.types';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import menuService from '../services/menuService';

const COLLECTION_NAME = 'categories';

// Form for creating or editing categories
interface CategoryFormProps {
  initialData?: MenuCategory;
  onSubmit: (category: MenuCategory) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MenuCategory>({
    cat_name: initialData?.cat_name || '',
    cat_description: initialData?.cat_description || '',
    extras: initialData?.extras || [],
    addons: initialData?.addons || [],
    header: initialData?.header || '',
    footer: initialData?.footer || '',
    items: initialData?.items || []
  });

  const [newExtra, setNewExtra] = useState<MenuItemExtra>({ item: '', price: 0 });
  const [newAddon, setNewAddon] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExtra = () => {
    if (newExtra.item && newExtra.price >= 0) {
      setFormData(prev => ({
        ...prev,
        extras: [...prev.extras, newExtra]
      }));
      setNewExtra({ item: '', price: 0 });
    }
  };

  const handleRemoveExtra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }));
  };

  const handleAddAddon = () => {
    if (newAddon.trim()) {
      const addonObject: MenuItemAddon = { item: newAddon.trim() };
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, addonObject]
      }));
      setNewAddon('');
    }
  };

  const handleRemoveAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input
            type="text"
            name="cat_name"
            value={formData.cat_name}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="cat_description"
            value={formData.cat_description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Header & Footer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
          <textarea
            name="header"
            value={formData.header}
            onChange={handleInputChange}
            placeholder="Header text"
            className="w-full p-2 border rounded"
          />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
          <textarea
            name="footer"
            value={formData.footer}
            onChange={handleInputChange}
            placeholder="Footer text"
            className="w-full p-2 border rounded"
          />
      </div>

      {/* Extras (with price) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Extras (Additional items with cost)</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newExtra.item}
            onChange={(e) => setNewExtra({ ...newExtra, item: e.target.value })}
            placeholder="Extra Item"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="number"
            value={newExtra.price}
            onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) })}
            placeholder="Price"
            className="w-24 p-2 border rounded"
            min="0"
            step="0.01"
          />
          <button
            type="button"
            onClick={handleAddExtra}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {formData.extras.map((extra, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{extra.item}</span>
              <div className="flex items-center">
                <span className="mr-2">{extra.price.toFixed(2)}€</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExtra(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons (No price) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add-ons (Selection options)</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAddon}
            onChange={(e) => setNewAddon(e.target.value)}
            placeholder="Add-on Option"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleAddAddon}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {formData.addons.map((addon, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{addon.item}</span>
              <button
                type="button"
                onClick={() => handleRemoveAddon(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Category
        </button>
      </div>
    </form>
  );
};

// Items management modal component
interface ItemsManagementProps {
  category: MenuCategory;
  onSave: (itemIds: string[]) => Promise<void>;
  onClose: () => void;
}

const ItemsManagement: React.FC<ItemsManagementProps> = ({ category, onSave, onClose }) => {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(category.items || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu_items'));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        
        setAllItems(items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItemIds(prev => [...prev, itemId]);
    }
  };

  const handleSave = () => {
    onSave(selectedItemIds);
  };

  if (loading) {
    return <div className="text-center p-4">Loading items...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Manage Items in {category.cat_name}</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Select items to include in this category:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {allItems.map(item => (
            <div 
              key={item.id}
              className={`border p-3 rounded cursor-pointer ${
                selectedItemIds.includes(item.id!) ? 'bg-blue-50 border-blue-500' : 'bg-gray-50'
              }`}
              onClick={() => handleToggleItem(item.id!)}
            >
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedItemIds.includes(item.id!)}
                  onChange={() => {}} // Handled by onClick on the div
                  className="mr-2"
                />
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Items
        </button>
      </div>
    </div>
  );
};

// Main Categories component
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isItemsManagementVisible, setIsItemsManagementVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { currentUser } = useAuth();

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
      const dataWithTimestamp = {
        ...dataToAdd,
        createdAt: new Date(),
        updatedAt: new Date()
      };
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
        items: categoryData.items || [],
        updatedAt: new Date()
      };
      
      await updateDoc(categoryRef, updateData);
      await menuService.updateMenusContainingCategory(selectedCategory.id);
      
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

        await menuService.updateMenusContainingCategory(categoryId);
        
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
        items: itemIds,
        updatedAt: new Date()
      });
      await menuService.updateMenusContainingCategory(selectedCategory.id);
      
      
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{category.cat_name}</h3>
              </div>
              <div>{category.header}</div>
              <p className="text-gray-600 mb-4">{category.cat_description}</p>
              <div>{category.footer}</div>
              {/* Category Details */}
              <div className="space-y-4">
                {category.extras.length > 0 && (
                  <div>
                    <p className="font-medium">Extras:</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {category.extras.map((extra, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{extra.item}</span>
                          <span>{extra.price.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {category.addons.length > 0 && (
                  <div>
                    <p className="font-medium">Add-ons:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {category.addons.map((addon, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {addon.item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display related menu items */}
                {category.items && category.items.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">Menu Items:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {category.items.map((itemId) => {
                        const item = menuItems.find(item => item.id === itemId);
                        return item ? (
                          <span
                            key={itemId}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                          >
                            {item.item_name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsItemsManagementVisible(true);
                  }}
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Manage Items
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFormVisible(true);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id!)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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