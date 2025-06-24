// src/components/ItemTable.tsx
import React from 'react';
import { MenuItem, MenuCategory } from '../types/menu.types';
import { Link } from 'react-router-dom';

interface ItemTableProps {
  items: MenuItem[];
  categories: MenuCategory[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleStatus: (itemId: string, currentStatus: boolean) => void;
}

const ItemTable: React.FC<ItemTableProps> = ({ 
  items, 
  categories, 
  onEdit, 
  onDelete, 
  onToggleStatus 
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
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => {
            // Find the category for this item
            const itemCategory = categories.find(cat => cat.id === item.category);
            
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.item_description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{itemCategory?.cat_name || 'Uncategorized'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                {item.flags.options ? (
                  <div className="text-green-600 text-sm font-medium"><span className=" text-xs font-thin">from </span>{item.price.toFixed(2)}€</div>
                  ):
                  <div className="text-sm font-medium text-green-600">{item.price.toFixed(2)}€</div>
                }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(item.id!, item.flags.active)}
                    className={`px-2 py-1 rounded text-xs ${
                      item.flags.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.flags.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/menu-items/${item.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id!)}
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
    </div>
  );
};

export default ItemTable;