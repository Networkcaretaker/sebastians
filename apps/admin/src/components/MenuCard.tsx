// src/components/MenuCard.tsx
import React from 'react';
import { Menu, MenuCategory } from '../types/menu.types';
import { Link } from 'react-router-dom';

interface MenuCardProps {
  menu: Menu;
  categories: MenuCategory[];
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  onToggleStatus: (menuId: string, currentStatus: boolean) => void;
  onManageCategories: (menu: Menu) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  menu, 
  categories, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onManageCategories
}) => {
  // Helper function to get category names from IDs
  const getCategoryNames = (categoryIds: string[]): string[] => {
    return categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category ? category.cat_name : 'Unknown Category';
    });
  };

  const categoryNames = getCategoryNames(menu.categories);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{menu.menu_name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              menu.menu_type === 'web' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {menu.menu_type === 'web' ? 'Web' : 'Print'}
            </span>
            <button
              onClick={() => onToggleStatus(menu.id!, menu.isActive)}
              className={`px-2 py-1 rounded text-xs ${
                menu.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {menu.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
        
        {menu.menu_description && (
          <p className="text-gray-600 mb-3">{menu.menu_description}</p>
        )}
        
        {/* Menu Details */}
        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm text-gray-700">Categories ({categoryNames.length}):</p>
            {categoryNames.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {categoryNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No categories assigned</p>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Order: {menu.menu_order}</span>
            <span>Updated: {menu.updatedAt ? new Date(menu.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link 
            to={`/menus/${menu.id}`}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
          >
            View Details
          </Link>
          <button
            onClick={() => onManageCategories(menu)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
          >
            Manage Categories
          </button>
          <button
            onClick={() => onEdit(menu)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(menu.id!)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;