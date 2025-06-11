// src/components/MenuForm.tsx
import React, { useState, useEffect } from 'react';
import { Menu, CreateMenuDTO, MENU_TYPES } from '../types/menu.types';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface MenuFormProps {
  onSubmit: (menu: CreateMenuDTO) => Promise<void>;
  initialData?: Menu;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<CreateMenuDTO>({
    menu_name: initialData?.menu_name || '',
    menu_description: initialData?.menu_description || '',
    menu_type: initialData?.menu_type || 'web',
    categories: initialData?.categories || [],
    isActive: initialData?.isActive ?? true,
    menu_order: initialData?.menu_order || 0
  });

  const [loading, setLoading] = useState(false);

  // Update menu_order when menu_type changes (for new menus only)
  useEffect(() => {
    const getNextMenuOrder = async () => {
      // Only run this for new menus (without initialData)
      if (initialData || !formData.menu_type) return;
      
      try {
        // Get the highest menu_order for this menu type
        const q = query(
          collection(db, 'menus'),
          where('menu_type', '==', formData.menu_type),
          orderBy('menu_order', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const highestOrderMenu = querySnapshot.docs[0].data();
          // Set the new order to be one higher than the current highest
          const nextOrder = (highestOrderMenu.menu_order || 0) + 1;
          
          setFormData(prev => ({
            ...prev,
            menu_order: nextOrder
          }));
        } else {
          // If no menus of this type yet, start with 0
          setFormData(prev => ({
            ...prev,
            menu_order: 0
          }));
        }
      } catch (error) {
        console.error('Error getting next menu order:', error);
      }
    };
    
    getNextMenuOrder();
  }, [formData.menu_type, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting menu form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Menu Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
          <input
            type="text"
            name="menu_name"
            value={formData.menu_name}
            onChange={handleInputChange}
            placeholder="e.g., Main Menu, Lunch Menu, Dinner Menu"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="menu_description"
            value={formData.menu_description}
            onChange={handleInputChange}
            placeholder="Brief description of this menu"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type</label>
          <select
            name="menu_type"
            value={formData.menu_type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value={MENU_TYPES.WEB}>Web Menu (Continuous Scrolling)</option>
            <option value={MENU_TYPES.PRINTABLE}>Printable Menu (A4 Format)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {formData.menu_type === 'web' 
              ? 'Perfect for digital displays and mobile devices'
              : 'Optimized for printing on A4 paper'
            }
          </p>
        </div>

        {/* Menu Order (show for editing existing menus) */}
        {initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu Order</label>
            <input
              type="number"
              name="menu_order"
              value={formData.menu_order}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Lower numbers appear first in the menu list
            </p>
          </div>
        )}
      </div>

      {/* Menu Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Menu Status</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Menu is active and visible to customers
          </label>
        </div>
        {!formData.isActive && (
          <p className="text-sm text-amber-600">
            Inactive menus are hidden from customers but can still be edited
          </p>
        )}
      </div>

      {/* Categories Info */}
      {formData.categories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Categories</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">
              This menu currently has {formData.categories.length} categories.
            </p>
            <p className="text-sm text-gray-500">
              Use the "Manage Categories" button after saving to add, remove, or reorder categories.
            </p>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Menu' : 'Create Menu'}
        </button>
      </div>
    </form>
  );
};

export default MenuForm;