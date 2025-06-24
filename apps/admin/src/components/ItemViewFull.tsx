// src/components/ItemView.tsx
import React from 'react';
import { MenuItem } from '../types/menu.types';

interface ItemViewProps {
  item: MenuItem;
}

const ItemViewFull: React.FC<ItemViewProps> = ({ item }) => {
  return (
    <div className="">
 
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700">Item:</label>
            <p className="text-lg mt-1">{item.item_name}</p>
          </div>
          <div>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Item
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price:</label>
          <div className="text-green-600 font-medium">{item.price.toFixed(2)}€</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status:</label>
          <div className={`px-2 py-1 rounded text-xs ${
            item.flags.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {item.flags.active ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <p className="text-gray-600 mt-1">{item.item_description || 'None'}</p>
        </div>
        
        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Options:</label>
          {item.options && item.options.length > 0 ? (
            <div className="mt-1 space-y-1">
              {item.options.map((option, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{option.option}</span>
                  <span className="text-green-600">{option.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-1">None</p>
          )}
        </div>
        
        {/* Extras */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Extras:</label>
          {item.extras && item.extras.length > 0 ? (
            <div className="mt-1 space-y-1">
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between">
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
          <label className="block text-sm font-medium text-gray-700">Add-ons:</label>
          {item.addons && item.addons.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.addons.map((addon, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {addon.item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-1">None</p>
          )}
        </div>
        
        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Allergies:</label>
          {item.allergies && item.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.allergies.map((allergy, idx) => (
                <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-1">None</p>
          )}
        </div>
        
        {/* Special flags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dietary Information:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {item.flags.vegetarian ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Vegetarian
              </span>
            ) : (
              <p className="text-gray-500 italic">None</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemViewFull;