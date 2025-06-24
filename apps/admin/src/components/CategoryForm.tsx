// src/components/CategoryForm.tsx
import React, { useState } from 'react';
import { MenuCategory, MenuItemExtra, MenuItemAddon } from '../types/menu.types';

interface CategoryFormProps {
  initialData?: MenuCategory;
  onSubmit: (category: MenuCategory) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MenuCategory>({
    cat_name: initialData?.cat_name || '',
    cat_description: initialData?.cat_description || '',
    extras: initialData?.extras || [],
    addons: initialData?.addons || [],
    header: initialData?.header || '',
    footer: initialData?.footer || '',
    items: initialData?.items || []
  });

  const [newExtra, setNewExtra] = useState<MenuItemExtra>({ item: '', price: 0 });
  const [newAddon, setNewAddon] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExtra = () => {
    if (newExtra.item && newExtra.price >= 0) {
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
      const addonObject: MenuItemAddon = { item: newAddon.trim() };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input
            type="text"
            name="cat_name"
            value={formData.cat_name}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="cat_description"
            value={formData.cat_description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Header & Footer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
          <textarea
            name="header"
            value={formData.header}
            onChange={handleInputChange}
            placeholder="Header text"
            className="w-full p-2 border rounded"
          />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
          <textarea
            name="footer"
            value={formData.footer}
            onChange={handleInputChange}
            placeholder="Footer text"
            className="w-full p-2 border rounded"
          />
      </div>

      {/* Extras (with price) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Extras (Additional items with cost)</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newExtra.item}
            onChange={(e) => setNewExtra({ ...newExtra, item: e.target.value })}
            placeholder="Extra Item"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="number"
            value={newExtra.price}
            onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) })}
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

      {/* Add-ons (No price) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add-ons (Selection options)</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAddon}
            onChange={(e) => setNewAddon(e.target.value)}
            placeholder="Add-on Option"
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Category
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;