// src/components/CategoryViewFull.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory, MenuItem } from '../types/menu.types';
import ItemViewFull from './ItemViewFull';

interface CategoryViewFullProps {
  category: MenuCategory;
  menuItems: MenuItem[];
}

const CategoryViewFull: React.FC<CategoryViewFullProps> = ({ category, menuItems }) => {
  return (
    <>
      {/* Category Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex gap-2 justify-between items-center">
          <h2 className="text-2xl font-semibold mb-4">Category Information</h2>
          <button
            onClick={() => {}}
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
                    <span className="text-green-600">${extra.price.toFixed(2)}</span>
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
      
      {/* Menu Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
    </>
  );
};

export default CategoryViewFull;