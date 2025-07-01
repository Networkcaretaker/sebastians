// src/components/SortableItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuItem } from '../types/menu.types';

interface SortableItemProps {
  id: string;
  item: MenuItem;
  index: number;
  onRemove?: (itemId: string) => void; // Optional remove functionality
}

const SortableItem: React.FC<SortableItemProps> = ({ id, item, index, onRemove }) => {
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
      className="bg-white border rounded-md mb-2 hover:bg-gray-50 cursor-move"
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
            <p className="font-medium text-sm">{item.item_name}</p>
          </div>
          {!item.flags?.active && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Drag handle icon */}
          <div className="text-gray-400 cursor-move" {...attributes} {...listeners}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          {/* Remove button - only show if onRemove is provided */}
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove from category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortableItem;