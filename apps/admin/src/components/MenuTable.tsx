// src/components/MenuTable.tsx
import React from 'react';
import { Menu, MenuCategory } from '../types/menu.types';
import { Link } from 'react-router-dom';

interface MenuTableProps {
  menus: Menu[];
  categories: MenuCategory[];
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  onToggleStatus: (menuId: string, currentStatus: boolean) => void;
  onManageCategories: (menu: Menu) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({ 
  menus, 
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

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Menu Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categories
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {menus.map(menu => {
            const categoryNames = getCategoryNames(menu.categories);
            
            return (
              <tr key={menu.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{menu.menu_name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{menu.menu_description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    menu.menu_type === 'web' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {menu.menu_type === 'web' ? 'Web Menu' : 'Printable'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {categoryNames.length > 0 ? (
                      <>
                        {categoryNames.slice(0, 2).map((name, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                          >
                            {name}
                          </span>
                        ))}
                        {categoryNames.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{categoryNames.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No categories</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {menu.menu_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/menus/${menu.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => onManageCategories(menu)}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => onEdit(menu)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(menu.id!)}
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
      
      {/* No menus message */}
      {menus.length === 0 && (
        <div className="py-6 text-center text-gray-500">
          No menus found. Create your first menu to get started.
        </div>
      )}
    </div>
  );
};

export default MenuTable;