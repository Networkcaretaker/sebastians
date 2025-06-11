// src/components/CategoryManagement.tsx
import React, { useState, useEffect } from 'react';
import { Menu, MenuCategory } from '../types/menu.types';
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
import SortableCategory from './SortableCategory';

interface CategoryManagementProps {
  menu: Menu;
  categories: MenuCategory[];
  onSave: (categoryIds: string[]) => Promise<void>;
  onClose: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ 
  menu, 
  categories, 
  onSave, 
  onClose 
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(menu.categories || []);
  const [availableCategories, setAvailableCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Filter out categories that are already selected
    const available = categories.filter(cat => 
      cat.id && !selectedCategoryIds.includes(cat.id)
    );
    setAvailableCategories(available);
  }, [categories, selectedCategoryIds]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedCategoryIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddCategory = (categoryId: string) => {
    if (!selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(prev => [...prev, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedCategoryIds);
    } catch (error) {
      console.error('Error saving menu categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get selected categories with their data
  const selectedCategories = selectedCategoryIds.map(id => 
    categories.find(cat => cat.id === id)
  ).filter(Boolean) as MenuCategory[];

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">
        Manage Categories for "{menu.menu_name}"
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Categories */}
        <div>
          <h4 className="text-lg font-medium mb-3">Available Categories</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {availableCategories.length > 0 ? (
              <div className="space-y-2">
                {availableCategories.map(category => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between bg-white p-3 rounded border hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{category.cat_name}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {category.cat_description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddCategory(category.id!)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                All categories have been added to this menu
              </p>
            )}
          </div>
        </div>

        {/* Selected Categories (Draggable) */}
        <div>
          <h4 className="text-lg font-medium mb-3">
            Menu Categories ({selectedCategories.length})
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {selectedCategories.length > 0 ? (
              <>
                <p className="text-sm text-blue-700 mb-3">
                  Drag to reorder • Categories will appear in this order on the menu
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedCategoryIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedCategories.map((category, index) => (
                        <SortableCategory
                          key={category.id}
                          id={category.id!}
                          category={category}
                          index={index}
                          onRemove={handleRemoveCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No categories selected. Add categories from the left panel.
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
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Categories'}
        </button>
      </div>
    </div>
  );
};

export default CategoryManagement;