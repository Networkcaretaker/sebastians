// src/components/CategorySort.tsx
import React, { useState } from 'react';
import { MenuCategory, MenuItem } from '../types/menu.types';
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
import menuService from '../services/menuItemService';

interface CategorySortProps {
  category: MenuCategory;
  menuItems: MenuItem[];
  onOrderSaved?: () => void;
}

const CategorySort: React.FC<CategorySortProps> = ({ category, menuItems, onOrderSaved }) => {
  // Sort the items by menu_order
  const [items, setItems] = useState(
    [...menuItems].sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      
      // Create an array of { id, menu_order } objects for the update
      const updatedOrder = items.map((item, index) => ({
        id: item.id!,
        menu_order: index
      }));
      
      await menuService.updateMenuOrder(updatedOrder);
      setSaveStatus('success');
      
      // Check if onOrderSaved exists before calling it
      if (onOrderSaved) {
        onOrderSaved(); // Call the callback to notify parent component
      }
    } catch (error) {
      console.error('Error saving menu order:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Category Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{category.cat_name}</h2>
          <div className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Order'}
          </button>
        </div>

        {/* Status message */}
        {saveStatus === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Order saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error saving order. Please try again.
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-blue-700">
            <strong>Reordering Instructions:</strong> Drag and drop items to rearrange their order. Click "Save Order" when finished.
          </p>
        </div>

        {/* Menu Items Section */}
        {items.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {items.map((item, index) => (
                  <SortableItem 
                    key={item.id}
                    id={item.id!}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-500">No menu items in this category.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategorySort;