// src/components/SortableCategory.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuCategory } from '../types/menu.types';

interface SortableCategoryProps {
  id: string;
  category: MenuCategory;
  index: number;
  onRemove: (categoryId: string) => void;
}

const SortableCategory: React.FC<SortableCategoryProps> = ({ 
  id, 
  category, 
  index, 
  onRemove 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white border rounded-md hover:bg-gray-50 cursor-move"
    >
      <div className="flex justify-between items-center p-3">
        <div 
          className="flex items-center gap-3 flex-1"
          {...attributes}
          {...listeners}
        >
          <span className="text-gray-500 font-medium text-sm bg-gray-100 px-2 py-1 rounded">
            #{index + 1}
          </span>
          <div className="flex-1">
            <p className="font-medium">{category.cat_name}</p>
            {category.cat_description && (
              <p className="text-sm text-gray-600 truncate">
                {category.cat_description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Drag handle icon */}
          <div className="text-gray-400 cursor-move" {...attributes} {...listeners}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          {/* Remove button */}
          <button
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Remove from menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableCategory;