// src/components/ItemsManagement.tsx
import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface ItemsManagementProps {
  category: MenuCategory;
  onSave: (itemIds: string[]) => Promise<void>;
  onClose: () => void;
}

const ItemsManagement: React.FC<ItemsManagementProps> = ({ 
  category, 
  onSave, 
  onClose 
}) => {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(category.items || []);
  const [availableItems, setAvailableItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  useEffect(() => {
    // Filter items that:
    // 1. Are not already selected in this category
    // 2. Do not have a category assigned (item.category is null/undefined/empty)
    const available = allItems.filter(item => 
      item.id && 
      !selectedItemIds.includes(item.id) &&
      (!item.category || item.category === '')
    );
    setAvailableItems(available);
  }, [allItems, selectedItemIds]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedItemIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddItem = (itemId: string) => {
    if (!selectedItemIds.includes(itemId)) {
      setSelectedItemIds(prev => [...prev, itemId]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds(prev => prev.filter(id => id !== itemId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedItemIds);
    } catch (error) {
      console.error('Error saving category items:', error);
    } finally {
      setSaving(false);
    }
  };

  // Get selected items with their data
  const selectedItems = selectedItemIds.map(id => 
    allItems.find(item => item.id === id)
  ).filter(Boolean) as MenuItem[];

  if (loading) {
    return <div className="text-center p-4">Loading items...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">
        Manage Items for "{category.cat_name}"
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <div>
          <h4 className="text-lg font-medium mb-3">Available Items</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {availableItems.length > 0 ? (
              <div className="space-y-2">
                {availableItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between bg-white p-3 rounded border hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                        {!item.flags?.active && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddItem(item.id!)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No uncategorized items available. All items without categories have been added.
              </p>
            )}
          </div>
        </div>

        {/* Selected Items (Draggable) */}
        <div>
          <h4 className="text-lg font-medium mb-3">
            Category Items ({selectedItems.length})
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {selectedItems.length > 0 ? (
              <>
                <p className="text-sm text-blue-700 mb-3">
                  Drag to reorder • Items will appear in this order on the menu
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedItemIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedItems.map((item, index) => (
                        <SortableItem
                          key={item.id}
                          id={item.id!}
                          item={item}
                          index={index}
                          onRemove={handleRemoveItem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No items selected. Add items from the left panel.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Items'}
        </button>
      </div>
    </div>
  );
};

export default ItemsManagement;