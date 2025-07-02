// src/components/ItemViewFull.tsx
import React, { useState } from 'react';
import { MenuItem, MenuItemOption, MenuItemExtra } from '../types/menu.types';
import menuItemService from '../services/menuItemService';

// Predefined allergies list
const PREDEFINED_ALLERGIES: string[] = [
  'Celery',
  'Corn',
  'Dairy',
  'Eggs',
  'Fish',
  'Gluten',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Nuts',
  'Peanuts',
  'Propolis',
  'Sesame',
  'Shellfish',
  'Soya',
  'Sulphites',
  'Wheat'
];

interface ItemViewProps {
  item: MenuItem;
  onItemUpdated?: () => void; // Callback to refresh data after update
}

const ItemViewFull: React.FC<ItemViewProps> = ({ item, onItemUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    item_name: item.item_name,
    price: item.price,
    item_description: item.item_description || '',
    flags: {
      active: item.flags.active,
      vegetarian: item.flags.vegetarian,
      vegan: item.flags.vegan,
      spicy: item.flags.spicy
    },
    options: [...(item.options || [])],
    extras: [...(item.extras || [])],
    addons: [...(item.addons || [])],
    allergies: [...(item.allergies || [])]
  });

  // State for new options/extras/addons
  const [newOption, setNewOption] = useState<MenuItemOption>({ option: '', price: 0 });
  const [newExtra, setNewExtra] = useState<MenuItemExtra>({ item: '', price: 0 });
  const [newAddon, setNewAddon] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'active') {
        setFormData(prev => ({
          ...prev,
          flags: { ...prev.flags, active: checked }
        }));
      }
      else if (name === 'vegetarian') {
        setFormData(prev => ({
          ...prev,
          flags: { ...prev.flags, vegetarian: checked }
        }));
      }
      else if (name === 'vegan') {
        setFormData(prev => ({
          ...prev,
          flags: { ...prev.flags, vegan: checked }
        }));
      }
      else if (name === 'spicy') {
        setFormData(prev => ({
          ...prev,
          flags: { ...prev.flags, spicy: checked }
        }));
      }
    } else if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddOption = () => {
    if (newOption.option.trim() && newOption.price >= 0) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption]
      }));
      setNewOption({ option: '', price: 0 });
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleAddExtra = () => {
    if (newExtra.item.trim() && newExtra.price >= 0) {
      setFormData(prev => ({
        ...prev,
        extras: [...prev.extras, newExtra]
      }));
      setNewExtra({ item: '', price: 0 });
    }
  };

  const handleRemoveExtra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }));
  };

  const handleAddAddon = () => {
    if (newAddon.trim()) {
      const addonObject = { item: newAddon.trim(), price: 0 };
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, addonObject]
      }));
      setNewAddon('');
    }
  };

  const handleRemoveAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const handleAllergyToggle = (allergy: string) => {
    const isSelected = formData.allergies.includes(allergy);

    if (isSelected) {
      // Remove the allergy if already selected
      setFormData(prev => ({
        ...prev,
        allergies: prev.allergies.filter(item => item !== allergy)
      }));
    } else {
      // Add the allergy if not selected
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!formData.item_name.trim()) {
      setError('Item name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        item_name: formData.item_name.trim(),
        price: formData.price,
        item_description: formData.item_description.trim(),
        flags: {
          ...item.flags, // Preserve other flags
          active: formData.flags.active,
          vegetarian: formData.flags.vegetarian,
          vegan: formData.flags.vegan,
          spicy: formData.flags.spicy,
          options: formData.options.length > 0,
          extras: formData.extras.length > 0,
          addons: formData.addons.length > 0
        },
        options: formData.options,
        extras: formData.extras,
        addons: formData.addons,
        allergies: formData.allergies
      };

      await menuItemService.updateMenuItem(item.id!, updateData);
      
      setIsEditing(false);
      
      // Call the callback to refresh parent data
      if (onItemUpdated) {
        onItemUpdated();
      }
      
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      item_name: item.item_name,
      price: item.price,
      item_description: item.item_description || '',
      flags: {
        active: item.flags.active,
        vegetarian: item.flags.vegetarian,
        vegan: item.flags.vegan,
        spicy: item.flags.spicy
      },
      options: [...(item.options || [])],
      extras: [...(item.extras || [])],
      addons: [...(item.addons || [])],
      allergies: [...(item.allergies || [])]
    });
    
    // Reset new item states
    setNewOption({ option: '', price: 0 });
    setNewExtra({ item: '', price: 0 });
    setNewAddon('');
    
    setError(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isEditing) {
    // Display mode (original view)
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
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit Item
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description:</label>
            <p className="text-gray-600 mt-1">{item.item_description || 'None'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price:</label>
            <div className="text-green-600 font-medium">{item.price.toFixed(2)}€</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status:</label>
            <div className={`inline-block px-2 py-1 rounded text-xs ${
              item.flags.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.flags.active ? 'Active' : 'Inactive'}
            </div>
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

          {/* Addons */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Add-ons:</label>
            {item.addons && item.addons.length > 0 ? (
              <div className="mt-1">
                <div className="flex flex-wrap gap-1">
                  {item.addons.map((addon, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {addon.item}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-1">None</p>
            )}
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Allergies:</label>
            {item.allergies && item.allergies.length > 0 ? (
              <div className="mt-1">
                <div className="flex flex-wrap gap-1">
                  {item.allergies.map((allergy, idx) => (
                    <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-1">None</p>
            )}
          </div>

          {/* Flags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flags:</label>
            {item.flags.vegetarian || item.flags.vegan || item.flags.spicy ? (
              <div>
                {item.flags.vegetarian 
                  ? <div className='inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800'>🌱 Vegetarian</div> 
                  : <div/>
                }
                {item.flags.vegan 
                  ? <div className='inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800'>🌱 Vegan</div> 
                  : <div/>
                }
                {item.flags.spicy 
                  ? <div className='inline-block px-2 py-1 rounded text-xs bg-red-100 text-red-800'>🌶️ Spicy</div> 
                  : <div/>
                }
              </div>
            ) : (
              <p className="text-gray-500 italic mt-1">None</p>
            )}
          </div>
          
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Action buttons at top */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Edit Item</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="item_description"
            value={formData.item_description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
          <label className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="checkbox"
                name="active"
                checked={formData.flags.active}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                formData.flags.active ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                  formData.flags.active ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </div>
            </div>
          </label>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Options (choices with different prices)</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newOption.option}
              onChange={(e) => setNewOption({ ...newOption, option: e.target.value })}
              placeholder="Option name"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={newOption.price}
              onChange={(e) => setNewOption({ ...newOption, price: parseFloat(e.target.value) || 0 })}
              placeholder="Price"
              className="w-24 p-2 border rounded"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{option.option}</span>
                <div className="flex items-center">
                  <span className="mr-2">{option.price.toFixed(2)}€</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Extras (additional items with cost)</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newExtra.item}
              onChange={(e) => setNewExtra({ ...newExtra, item: e.target.value })}
              placeholder="Extra item"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={newExtra.price}
              onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) || 0 })}
              placeholder="Price"
              className="w-24 p-2 border rounded"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={handleAddExtra}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {formData.extras.map((extra, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{extra.item}</span>
                <div className="flex items-center">
                  <span className="mr-2">{extra.price.toFixed(2)}€</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Add-ons (selection options)</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newAddon}
              onChange={(e) => setNewAddon(e.target.value)}
              placeholder="Add-on option"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleAddAddon}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {formData.addons.map((addon, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{addon.item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAddon(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Allergies</h4>
          <p className="text-sm text-gray-600">Select all allergies that apply to this menu item:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PREDEFINED_ALLERGIES.map((allergy, index) => {
              const isSelected = formData.allergies.includes(allergy);
              return (
                <div 
                  key={index} 
                  className={`border p-2 rounded cursor-pointer flex items-center ${
                    isSelected ? 'bg-red-50 border-red-500' : 'bg-gray-50'
                  }`}
                  onClick={() => handleAllergyToggle(allergy)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by the div onClick
                    className="mr-2"
                  />
                  <span>{allergy}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2">
            <p className="font-medium">Selected Allergies:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.allergies.length === 0 ? (
                <span className="text-gray-500 italic">No allergies selected</span>
              ) : (
                formData.allergies.map((allergy, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {allergy}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Flags */}
        <div>
          <h4 className="text-md font-semibold">Flags</h4>
          <div className="grid grid-cols-2 md:grid-cols-8 items-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vegetarian</label>
            <label className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={formData.flags.vegetarian}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                  formData.flags.vegetarian ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                    formData.flags.vegetarian ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vegan</label>
            <label className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="vegan"
                  checked={formData.flags.vegan}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                  formData.flags.vegan ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                    formData.flags.vegan ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spicy</label>
            <label className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="spicy"
                  checked={formData.flags.spicy}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-12 h-8 py-1 rounded-full cursor-pointer transition-colors ${
                  formData.flags.spicy ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${
                    formData.flags.spicy ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
              </div>
            </label>            
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemViewFull;