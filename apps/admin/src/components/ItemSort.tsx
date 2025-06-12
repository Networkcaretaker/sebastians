// src/components/ItemSort.tsx
import React from 'react';
import { MenuItem } from '../types/menu.types';

interface ItemSortProps {
  item: MenuItem;
  index: number;
}

const ItemSort: React.FC<ItemSortProps> = ({ item, index }) => {
  return (
    <div className="flex justify-between items-center p-3 bg-white border rounded-md mb-2 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 font-medium">{index + 1}.</span>
        <span className="font-medium">{item.item_name}</span>
        {!item.flags.active && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
        )}
      </div>
      
      {/* Icon for future drag handle */}
      <div className="text-gray-400 cursor-move">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
};

export default ItemSort;