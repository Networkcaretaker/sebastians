// apps/admin/src/components/ItemPreview.tsx
import React, { useState, useEffect } from 'react';
import { MenuItem, MenuItemTranslation } from '../types/menu.types';
import { translationService } from '../services/translationService';

// Define supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
];

interface ItemViewProps {
  item: MenuItem;
}

const ItemPreview: React.FC<ItemViewProps> = ({ item }) => {

  const renderItemPreview = (
    itemData: MenuItem
  ) => {
    // Use translation data if available, otherwise use original
    const displayName = itemData.item_name;
    const displayDescription = itemData.item_description;
    const displayOptions = itemData.options?.map(opt => opt.option) || [];
    const displayExtras = itemData.extras?.map(extra => extra.item) || [];
    const displayAddons = itemData.addons?.map(addon => addon.item) || [];

    return (
      <div>  
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <h3 className="text-xl font-bold">{displayName}</h3>
              <div className="flex gap-1">
                {itemData.flags.vegetarian && (
                  <div className="flex gap-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Vegetarian
                    </span>
                  </div>
                )}
                {itemData.allergies && itemData.allergies.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {itemData.allergies.map((allergy, idx) => (
                      <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {itemData.flags.options && item.price > 0 ? (
              <div className="text-green-600 text-lg font-bold">
                <span className="text-sm font-medium">from </span>
                {itemData.price.toFixed(2)}€
              </div>
            ) : (
              <div className="text-green-600 text-lg font-bold">
                {item.price > 0 ? <div>{itemData.price.toFixed(2)}€</div> : <div />}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="mt-2">
            <p className="text-gray-600">{displayDescription || ''}</p>
          </div>

          {/* Add-ons */}
          {displayAddons.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2">
              {displayAddons.map((addon, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {addon}
                </span>
              ))}
            </div>
          )}
          
          {/* Options */}
          {itemData.options && itemData.options.length > 0 && (
            <div className="">
              {itemData.options.map((option, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-semibold">
                    {displayOptions[idx] || option.option}
                  </span>
                  <span className="text-green-600 text-base font-semibold">
                    {option.price.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Extras */}
          {itemData.extras && itemData.extras.length > 0 && (
            <div className="mt-1 space-y-1">
              <label className="text-base font-medium text-gray-700">Extras:</label>
              {itemData.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-base px-4">
                    {displayExtras[idx] || extra.item}
                  </span>
                  <span className="text-green-600 font-medium">
                    {extra.price.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderItemPreview(item)}
    </div>
  );
};

export default ItemPreview;