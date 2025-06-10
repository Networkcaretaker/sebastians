// src/components/CategoryTable.tsx
import React from 'react';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { Link } from 'react-router-dom';

interface CategoryTableProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onEdit: (category: MenuCategory) => void;
  onDelete: (categoryId: string) => void;
  onManageItems: (category: MenuCategory) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  menuItems, 
  onEdit, 
  onDelete, 
  onManageItems 
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Extras/Add-ons
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map(category => {
            // Get all menu items for this category
            const categoryItems = menuItems.filter(item => 
              category.items && category.items.includes(item.id!)
            );
            
            return (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{category.cat_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-xs">{category.cat_description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {categoryItems.length > 0 ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {categoryItems.length} items
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">No items</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {category.extras.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Extras:</span> {category.extras.length}
                      </div>
                    )}
                    {category.addons.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Add-ons:</span> {category.addons.length}
                      </div>
                    )}
                    {category.extras.length === 0 && category.addons.length === 0 && (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/categories/${category.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      View Details
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* No categories message */}
      {categories.length === 0 && (
        <div className="py-6 text-center text-gray-500">
          No categories found. Add your first category to get started.
        </div>
      )}
    </div>
  );
};

export default CategoryTable;