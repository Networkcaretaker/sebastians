// apps/admin/src/components/MenuViewFull.tsx
import React, { useState } from 'react';
import { Menu } from '../types/menu.types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import menuService from '../services/menuService';

interface MenuViewFullProps {
  menu: Menu;
  onMenuUpdated?: () => void; // Callback to refresh data after update
}

const MenuViewFull: React.FC<MenuViewFullProps> = ({ 
  menu, 
  onMenuUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    menu_name: menu.menu_name,
    menu_description: menu.menu_description || '',
    menu_type: menu.menu_type,
    isActive: menu.isActive
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!formData.menu_name.trim()) {
      setError('Menu name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      if (!menu.id) {
        throw new Error('Menu ID is missing');
      }

      const updateData = {
        menu_name: formData.menu_name.trim(),
        menu_description: formData.menu_description.trim(),
        menu_type: formData.menu_type,
        isActive: formData.isActive,
        updatedAt: new Date()
      };

      const menuRef = doc(db, 'menus', menu.id);
      await updateDoc(menuRef, updateData);
      
      setIsEditing(false);
      
      // Call the callback to refresh parent data
      if (onMenuUpdated) {
        onMenuUpdated();
      }
      
    } catch (error) {
      console.error('Error updating menu:', error);
      setError(error instanceof Error ? error.message : 'Failed to update menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      menu_name: menu.menu_name,
      menu_description: menu.menu_description || '',
      menu_type: menu.menu_type,
      isActive: menu.isActive
    });
    
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
        {/* Menu Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-2 justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4">Menu Information</h2>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Menu
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Menu Name:</label>
              <p className="text-lg mt-1">{menu.menu_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <p className="mt-1">{menu.menu_description || 'None'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Menu Type:</label>
              <p className="mt-1 capitalize">{menu.menu_type}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status:</label>
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                menu.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {menu.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            {/* Categories Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Categories:</label>
              <p className="mt-1">
                {menu.categories && menu.categories.length > 0 
                  ? `${menu.categories.length} ${menu.categories.length === 1 ? 'category' : 'categories'}`
                  : 'No categories assigned'
                }
              </p>
            </div>

            {/* Timestamps */}
            {menu.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Created:</label>
                <p className="mt-1 text-sm text-gray-600">
                  {menu.createdAt.toLocaleDateString()} at {menu.createdAt.toLocaleTimeString()}
                </p>
              </div>
            )}

            {menu.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated:</label>
                <p className="mt-1 text-sm text-gray-600">
                  {menu.updatedAt.toLocaleDateString()} at {menu.updatedAt.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Edit mode
  return (
    <>
      {/* Menu Details Section - Edit Mode */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Action buttons at top */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Edit Menu</h2>
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

          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="menu_name"
              value={formData.menu_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="menu_description"
              value={formData.menu_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description for this menu"
            />
          </div>

          {/* Menu Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type</label>
            <select
              name="menu_type"
              value={formData.menu_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="web">Web Menu (Digital Display)</option>
              <option value="printable">Printable Menu (A4 Format)</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              {formData.menu_type === 'web' 
                ? 'Optimized for digital viewing and QR code access'
                : 'Formatted for printing on standard A4 paper'
              }
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
            <label className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                  formData.isActive ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                    formData.isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {formData.isActive ? 'Menu is active and can be published' : 'Menu is inactive'}
              </span>
            </label>
          </div>

          {/* Read-only info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Categories:</label>
                <p className="mt-1 text-gray-600">
                  {menu.categories && menu.categories.length > 0 
                    ? `${menu.categories.length} ${menu.categories.length === 1 ? 'category' : 'categories'}`
                    : 'No categories assigned'
                  }
                </p>
              </div>

              {menu.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created:</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {menu.createdAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuViewFull;