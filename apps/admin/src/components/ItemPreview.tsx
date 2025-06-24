// src/components/ItemView.tsx
import React from 'react';
import { MenuItem } from '../types/menu.types';

interface ItemViewProps {
  item: MenuItem;
}

const ItemPreview: React.FC<ItemViewProps> = ({ item }) => {
  return (
    <div>
      <div className="mb-2 mt-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <h3 className="text-xl font-bold">{item.item_name}</h3>
            <div className="flex gap-1">
              {item.flags.vegetarian ? (
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Vegetarian
                  </span>
                </div>
              ):''}
              {item.allergies && item.allergies.length > 0 ? (
                <div className="flex gap-1 mt-1">
                  {item.allergies.map((allergy, idx) => (
                    <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {allergy}
                    </span>
                  ))}
                </div>
              ):''}
            </div>
          </div>
          {item.flags.options ? (
            <div className="text-green-600 text-lg font-bold"><span className=" text-sm font-medium">from </span>{item.price.toFixed(2)}€</div>
            ):
            <div className="text-green-600 text-lg font-bold">{item.price.toFixed(2)}€</div>
          }
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="mt-2">
          {/*<label className="block text-sm font-medium text-gray-700">Description:</label>*/}
          <p className="text-gray-600">{item.item_description || ''}</p>
        </div>

        {/* Add-ons */}
        <div>
          {/* <label className="block text-sm font-medium text-gray-700">Add-ons:</label>*/}
          {item.addons && item.addons.length > 0 ? (
            <div className="flex flex-wrap gap-1 my-2">
              {item.addons.map((addon, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {addon.item}
                </span>
              ))}
            </div>
          ):''}
        </div>
        
        {/* Options */}
        <div>
          {/*<label className="block text-sm font-medium text-gray-700">Options:</label>*/}
          {item.options && item.options.length > 0 ? (
            <div className="">
              {item.options.map((option, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-base px-4">{option.option}</span>
                  <span className="text-green-600 text-base font-medium">{option.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          ):''}
        </div>
        
        {/* Extras */}
        <div>
          {/* <label className="block text-sm font-medium text-gray-700">Extras:</label>*/}
          {item.extras && item.extras.length > 0 ? (
            <div className="mt-1 space-y-1">
              <label className="text-base font-medium text-gray-700">Extras:</label>
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-base font-base px-4">{extra.item}</span>
                  <span className="text-green-600 font-medium">{extra.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>
          ):''}
        </div>
        
        
      </div>
    </div>
  );
};

export default ItemPreview;