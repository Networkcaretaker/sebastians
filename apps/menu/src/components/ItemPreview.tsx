// apps/menu/src/components/ItemPreview.tsx
import React from 'react';
import AllergyIcon from './AllergyIcon';

// Corrected interface to match your actual data structure
interface MenuItem {
  id: string;
  item_name: string;
  item_description?: string;
  item_price: number;
  item_order: number;
  isActive: boolean;
  // Fixed: allergies should be an array of strings, not array of arrays
  vegetarian?: boolean;
  allergies: string[];  // Changed from Array<[string]> to string[]
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
            <h3 className="text-base font-bold">{item.item_name}</h3>
          </div>
          {item.hasOptions || (item.options && item.options.length > 0) ? (
            <div className="text-green-600 text-base font-bold">
              <span className="text-xs font-medium">from </span>{item.item_price.toFixed(2)}€
            </div>
          ) : (
            <div className="text-green-600 text-base font-bold">{item.item_price.toFixed(2)}€</div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 pb-4 border-b">
        <div className="mt-2">
          <p className="text-gray-600 text-sm">{item.item_description || ''}</p>
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
            <h4 className="text-xs font-medium text-gray-700">Options:</h4>
            {item.options.map((option, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 px-4">{option.option}</span>
                <span className="text-green-600 font-bold">{option.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Extras */}
        {item.extras && item.extras.length > 0 && (
          <div className="mt-2 space-y-1">
            <h4 className="text-xs font-medium text-gray-700">Extras:</h4>
            {item.extras.map((extra, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 px-4">{extra.item}</span>
                <span className="text-green-600 font-bold">{extra.price.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}

        {/* Notice Flags */}
        {/* Display vegetarian indicator if applicable */}        
        {item.vegetarian && (
          <div className="flex text-center mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              🌱 Vegetarian
            </span>
          </div>
        )}
        
        {/* Allergies Section - Updated with Icons */}
        {item.allergies && item.allergies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <h4 className="text-xs font-medium text-red-700">Allergens:</h4>
            <div className="flex flex-wrap gap-1">
              {item.allergies.map((allergy, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium"
                >
                  <AllergyIcon 
                    allergy={allergy} 
                    size="sm"
                    className="text-red-800"
                  />
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemPreview;