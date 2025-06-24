// apps/menu/src/components/ItemPreview.tsx
import React from 'react';

// Based on your existing MenuData structure
interface MenuItem {
  id: string;
  item_name: string;
  item_description?: string;
  item_price: number;
  item_order: number;
  isActive: boolean;
  // Add other properties that might exist in your data structure
  vegetarian?: boolean;
  allergies?: string[];
  options?: Array<{ option: string; price: number }>;
  extras?: Array<{ item: string; price: number }>;
  addons?: Array<{ item: string }>;
  hasOptions?: boolean;
}

interface ItemPreviewProps {
  item: MenuItem;
}

const ItemPreview: React.FC<ItemPreviewProps> = ({ item }) => {
  return (
    <div>
      <div className="mb-2 mt-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <h3 className="text-xl font-bold">{item.item_name}</h3>
            <div className="flex gap-1">
              {item.vegetarian && (
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Vegetarian
                  </span>
                </div>
              )}
              {item.allergies && item.allergies.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.allergies.map((allergy, idx) => (
                    <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {allergy}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {item.hasOptions || (item.options && item.options.length > 0) ? (
            <div className="text-green-600 text-lg font-bold">
              <span className="text-sm font-medium">from </span>{item.item_price.toFixed(2)}€
            </div>
          ) : (
            <div className="text-green-600 text-lg font-bold">{item.item_price.toFixed(2)}€</div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="mt-2">
          <p className="text-gray-600">{item.item_description || ''}</p>
        </div>

        {/* Add-ons */}
        {item.addons && item.addons.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {item.addons.map((addon, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {addon.item}
              </span>
            ))}
          </div>
        )}
        
        {/* Options */}
        {item.options && item.options.length > 0 && (
          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-medium text-gray-700">Options:</h4>
            {item.options.map((option, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 px-4">{option.option}</span>
                <span className="text-green-600 font-medium">{option.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Extras */}
        {item.extras && item.extras.length > 0 && (
          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-medium text-gray-700">Extras:</h4>
            {item.extras.map((extra, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 px-4">{extra.item}</span>
                <span className="text-green-600 font-medium">{extra.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemPreview;