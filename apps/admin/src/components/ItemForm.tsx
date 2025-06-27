// src/components/ItemForm.tsx
import React, { useState, useEffect } from 'react';
import { MenuItem, CreateMenuItemDTO, MenuItemOption, MenuItemExtra, MenuCategory } from '../types/menu.types';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface MenuItemFormProps {
  onSubmit: (item: CreateMenuItemDTO) => Promise<void>;
  initialData?: MenuItem;
}

// Predefined options for addons (no prices) and allergies
const PREDEFINED_ADDONS: string[] = [
  'White bread',
  'Whole wheat bread',
  'Sourdough',
  'Rye bread',
  'Ketchup',
  'Mustard',
  'Mayo',
  'Aioli',
  'BBQ sauce',
  'Hot sauce',
  'Ranch dressing'
];

const PREDEFINED_ALLERGIES: string[] = [
  'Gluten',
  'Dairy',
  'Nuts',
  'Eggs',
  'Soy',
  'Shellfish',
  'Fish',
  'Wheat',
  'Peanuts',
  'Sesame'
];

const ItemForm: React.FC<MenuItemFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<CreateMenuItemDTO>({
    item_name: initialData?.item_name || '',
    item_description: initialData?.item_description || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    options: initialData?.options || [],
    extras: initialData?.extras || [],
    addons: initialData?.addons || [],
    flags: {
      active: initialData?.flags.active ?? true,
      vegetarian: initialData?.flags.vegetarian ?? false,
      extras: initialData?.flags.extras ?? false,
      addons: initialData?.flags.addons ?? false,
      options: initialData?.flags.options ?? false
    },
    allergies: initialData?.allergies || [],
    menu_order: initialData?.menu_order || 0
  });

  const [newOption, setNewOption] = useState<MenuItemOption>({ option: '', price: 0 });
  const [newExtra, setNewExtra] = useState<MenuItemExtra>({ item: '', price: 0 });
  const [newAddon, setNewAddon] = useState<string>('');
  
  // Add state for categories
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [_loading, setLoading] = useState(true);

  // Fetch available categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuCategory[];
        
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update menu_order when category changes
  useEffect(() => {
    const getNextMenuOrder = async () => {
      // Only run this for new items (without initialData)
      if (initialData || !formData.category) return;
      
      try {
        // Get the highest menu_order for this category
        const q = query(
          collection(db, 'menu_items'),
          where('category', '==', formData.category),
          orderBy('menu_order', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const highestOrderItem = querySnapshot.docs[0].data();
          // Set the new order to be one higher than the current highest
          const nextOrder = (highestOrderItem.menu_order || 0) + 1;
          
          setFormData(prev => ({
            ...prev,
            menu_order: nextOrder
          }));
        } else {
          // If no items in this category yet, start with 0
          setFormData(prev => ({
            ...prev,
            menu_order: 0
          }));
        }
      } catch (error) {
        console.error('Error getting next menu order:', error);
      }
    };
    
    getNextMenuOrder();
  }, [formData.category, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [name]: checked
      }
    }));
  };

  const handleAddOption = () => {
    if (newOption.option && newOption.price >= 0) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption],
        flags: { ...prev.flags, options: true }
      }));
      setNewOption({ option: '', price: 0 });
    }
  };

  const handleAddExtra = () => {
    if (newExtra.item && newExtra.price >= 0) {
      setFormData(prev => ({
        ...prev,
        extras: [...prev.extras, newExtra],
        flags: { ...prev.flags, extras: true }
      }));
      setNewExtra({ item: '', price: 0 });
    }
  };

  // Function to handle custom addon
  const handleAddCustomAddon = () => {
    if (newAddon.trim()) {
      const addonObject = { item: newAddon.trim(), price: 0 };
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, addonObject],
        flags: { ...prev.flags, addons: true }
      }));
      setNewAddon('');
    }
  };

  const handleAddonToggle = (addonName: string) => {
    const isSelected = formData.addons.some(
      selectedAddon => selectedAddon.item === addonName
    );

    if (isSelected) {
      // Remove the addon if already selected
      setFormData(prev => ({
        ...prev,
        addons: prev.addons.filter(item => item.item !== addonName),
        flags: {
          ...prev.flags,
          addons: prev.addons.filter(item => item.item !== addonName).length > 0
        }
      }));
    } else {
      // Add the addon if not selected (with price of 0)
      setFormData(prev => ({
        ...prev,
        addons: [...prev.addons, { item: addonName, price: 0 }],
        flags: { ...prev.flags, addons: true }
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category && initialData?.id) {
      // This is handled in the main component that uses this form
      // by calling both menuService.updateMenuItem and an additional
      // function to update the category's items array
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleInputChange}
            placeholder="Item Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            name="item_description"
            value={formData.item_description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Base Price"
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.cat_name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Flags */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
          <label className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="checkbox"
                name="active"
                checked={formData.flags.active}
                onChange={handleFlagChange}
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
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newOption.option}
            onChange={(e) => setNewOption({ ...newOption, option: e.target.value })}
            placeholder="Option Name"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="number"
            value={newOption.price}
            onChange={(e) => setNewOption({ ...newOption, price: parseFloat(e.target.value) })}
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
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{option.option}</span>
              <span>{option.price.toFixed(2)}€</span>
            </div>
          ))}
        </div>
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
        <div className="space-y-2">
          {formData.extras.map((extra, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{extra.item}</span>
              <span>{extra.price.toFixed(2)}€</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Save Menu Item
      </button>
    </form>
  );
};

export default ItemForm;