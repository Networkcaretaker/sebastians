// src/components/CategoryCard.tsx
import React from 'react';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: MenuCategory;
  menuItems: MenuItem[];
  onEdit: (category: MenuCategory) => void;
  onDelete: (categoryId: string) => void;
  onManageItems: (category: MenuCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  menuItems, 
  onEdit, 
  onDelete, 
  onManageItems 
}) => {
  // Get menu items for this category
  const categoryItems = menuItems.filter(item => 
    category.items && category.items.includes(item.id!)
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{category.cat_name}</h3>
        </div>
        
        {category.header && (
          <div className="text-sm text-gray-600 italic mb-2">{category.header}</div>
        )}
        
        <p className="text-gray-600 mb-4">{category.cat_description}</p>
        
        {category.footer && (
          <div className="text-sm text-gray-600 italic mb-2">{category.footer}</div>
        )}
        
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
          {categoryItems.length > 0 && (
            <div className="mt-3">
              <p className="font-medium">Menu Items:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {categoryItems.map((item) => (
                  <span
                    key={item.id}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  >
                    {item.item_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Link 
            to={`/categories/${category.id}`}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            View
          </Link>
          <button
            onClick={() => onManageItems(category)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Manage Items
          </button>
          <button
            onClick={() => onEdit(category)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category.id!)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;