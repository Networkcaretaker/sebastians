// src/components/ItemsManagement.tsx
import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ItemsManagementProps {
  category: MenuCategory;
  onSave: (itemIds: string[]) => Promise<void>;
  onClose: () => void;
}

const ItemsManagement: React.FC<ItemsManagementProps> = ({ category, onSave, onClose }) => {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(category.items || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu_items'));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        
        setAllItems(items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItemIds(prev => [...prev, itemId]);
    }
  };

  const handleSave = () => {
    onSave(selectedItemIds);
  };

  if (loading) {
    return <div className="text-center p-4">Loading items...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Manage Items in {category.cat_name}</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Select items to include in this category:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {allItems.map(item => (
            <div 
              key={item.id}
              className={`border p-3 rounded cursor-pointer ${
                selectedItemIds.includes(item.id!) ? 'bg-blue-50 border-blue-500' : 'bg-gray-50'
              }`}
              onClick={() => handleToggleItem(item.id!)}
            >
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedItemIds.includes(item.id!)}
                  onChange={() => {}} // Handled by onClick on the div
                  className="mr-2"
                />
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Items
        </button>
      </div>
    </div>
  );
};

export default ItemsManagement;