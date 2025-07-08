// src/components/CategoryViewFull.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory, MenuItem, MenuItemExtra, MenuItemAddon } from '../types/menu.types';
import ItemViewFull from './ItemViewFull';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface CategoryViewFullProps {
  category: MenuCategory;
  menuItems: MenuItem[];
  onCategoryUpdated?: () => void; // Callback to refresh data after update
}

const CategoryViewFull: React.FC<CategoryViewFullProps> = ({ 
  category, 
  menuItems, 
  onCategoryUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    cat_name: category.cat_name,
    cat_description: category.cat_description || '',
    header: category.header || '',
    footer: category.footer || '',
    extras: [...(category.extras || [])],
    addons: [...(category.addons || [])]
  });

  // State for new extras/addons
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
    if (newExtra.item.trim() && newExtra.price >= 0) {
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

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!formData.cat_name.trim()) {
      setError('Category name is required');
      return;
    }

    // Validate that all extra prices are numbers
    for (const extra of formData.extras) {
      if (isNaN(extra.price) || extra.price < 0) {
        setError('All extra prices must be valid numbers');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (!category.id) {
        throw new Error('Category ID is missing');
      }

      const updateData = {
        cat_name: formData.cat_name.trim(),
        cat_description: formData.cat_description.trim(),
        header: formData.header.trim(),
        footer: formData.footer.trim(),
        extras: formData.extras,
        addons: formData.addons
      };

      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, updateData);
      
      setIsEditing(false);
      
      // Call the callback to refresh parent data
      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
      
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      cat_name: category.cat_name,
      cat_description: category.cat_description || '',
      header: category.header || '',
      footer: category.footer || '',
      extras: [...(category.extras || [])],
      addons: [...(category.addons || [])]
    });
    
    // Reset new item states
    setNewExtra({ item: '', price: 0 });
    setNewAddon('');
    
    setError(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isEditing) {
    // Display mode (original view)
    return (
      <>
        {/* Category Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-2 justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4">Category Information</h2>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Category
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name:</label>
              <p className="text-lg mt-1">{category.cat_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <p className="mt-1">{category.cat_description || 'None'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Header Text:</label>
              <p className="mt-1">{category.header || 'None'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer Text:</label>
              <p className="mt-1">{category.footer || 'None'}</p>
            </div>
            
            {/* Extras */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Extras:</label>
              {category.extras && category.extras.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {category.extras.map((extra, idx) => (
                    <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>{extra.item}</span>
                      <span className="text-green-600">{extra.price.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mt-1">None</p>
              )}
            </div>
            
            {/* Add-ons */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Add-ons:</label>
              {category.addons && category.addons.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {category.addons.map((addon, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {addon.item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mt-1">None</p>
              )}
            </div>
            
            {/* Item Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Menu Items:</label>
              <p className="mt-1">
                {menuItems.length > 0 
                  ? `${menuItems.length} ${menuItems.length === 1 ? 'item' : 'items'}`
                  : 'No items in this category'
                }
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Edit mode
  return (
    <>
      {/* Category Details Section - Edit Mode */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Action buttons at top */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Edit Category</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cat_name"
              value={formData.cat_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="cat_description"
              value={formData.cat_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Header Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
            <textarea
              name="header"
              value={formData.header}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional text to display at the top of this category"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <textarea
              name="footer"
              value={formData.footer}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional text to display at the bottom of this category"
            />
          </div>

          {/* Extras */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Category Extras (additional items with cost)</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExtra.item}
                onChange={(e) => setNewExtra({ ...newExtra, item: e.target.value })}
                placeholder="Extra item"
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                value={newExtra.price}
                onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) || 0 })}
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

          {/* Add-ons */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Category Add-ons (selection options)</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAddon}
                onChange={(e) => setNewAddon(e.target.value)}
                placeholder="Add-on option"
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

          {/* Item Count (read-only in edit mode) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Menu Items:</label>
            <p className="mt-1 text-gray-600">
              {menuItems.length > 0 
                ? `${menuItems.length} ${menuItems.length === 1 ? 'item' : 'items'}`
                : 'No items in this category'
              }
            </p>
          </div>

        </div>
      </div>
      {/* Menu Items Section */}
      {/*<div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
        
        {menuItems.length > 0 ? (
          <div className="space-y-6">
            {menuItems.map(item => (
              <ItemViewFull key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-500">No menu items in this category.</p>
            <Link 
              to="/menu-items" 
              className="inline-flex items-center mt-2 text-blue-500 hover:text-blue-700"
            >
              Add items to this category →
            </Link>
          </div>
        )}
      </div>
      */}
    </>
  );
};

export default CategoryViewFull;