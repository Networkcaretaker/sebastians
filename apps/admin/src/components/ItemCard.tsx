// src/components/ItemCard.tsx
import React from 'react';
import { MenuItem, MenuCategory } from '../types/menu.types';

interface ItemCardProps {
  item: MenuItem;
  categories: MenuCategory[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleStatus: (itemId: string, currentStatus: boolean) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  categories, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  // Find the category for this item
  const itemCategory = categories.find(cat => cat.id === item.category);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{item.item_name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleStatus(item.id!, item.flags.active)}
              className={`px-2 py-1 rounded text-sm ${
                item.flags.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.flags.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2">{item.item_description}</p>
        <p className="text-green-600 font-semibold mb-2">{item.price.toFixed(2)}€</p>
        
        {/* Show category if available */}
        {itemCategory && (
          <p className="text-blue-600 text-sm mb-2">
            Category: {itemCategory.cat_name}
          </p>
        )}
        
        {/* Item Details */}
        <div className="space-y-2 flex-grow">
          {item.options.length > 0 && (
            <div>
              <p className="font-medium">Options:</p>
              <div className="text-sm text-gray-600">
                {item.options.map((opt, idx) => (
                  <div key={idx}>
                    {opt.option}: {opt.price.toFixed(2)}€
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.extras.length > 0 && (
            <div>
              <p className="font-medium">Extras:</p>
              <div className="text-sm text-gray-600">
                {item.extras.map((extra, idx) => (
                  <div key={idx}>
                    {extra.item}: {extra.price.toFixed(2)}€
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.allergies.length > 0 && (
            <div>
              <p className="font-medium">Allergies:</p>
              <div className="flex flex-wrap gap-1">
                {item.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
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
      </div>
    </div>
  );
};

export default ItemCard;