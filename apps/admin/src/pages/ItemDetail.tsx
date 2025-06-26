// src/pages/ItemDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MenuItem } from '../types/menu.types';
import ItemPreview from '../components/ItemPreview';
import ItemViewFull from '../components/ItemViewFull';
import menuItemService from '../services/menuItemService';
import ItemTranslate from '../components/ItemTranslate';

type ViewType = 'preview' | 'edit' | 'translate';

const ItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('preview');

  const fetchItem = async () => {
    if (!itemId) {
      setError('No item ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get all items and find the specific one
      // Note: You may want to create a getMenuItemById function in your service
      const allItems = await menuItemService.getAllMenuItems();
      const foundItem = allItems.find(item => item.id === itemId);
      
      if (foundItem) {
        setItem(foundItem);
      } else {
        setError('Item not found');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  // Callback function to refresh item data after update
  const handleItemUpdated = () => {
    fetchItem(); // Refresh the item data
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link 
          to="/menu-items" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Items
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Item not found</p>
        </div>
        <Link 
          to="/menu-items" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-2 md:mb-0">
          <Link 
            to="/menu-items" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            ← Back to Items
          </Link>
        </div>
        
        {/* View Type Toggle */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setViewType('preview')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              viewType === 'preview'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setViewType('edit')}
            className={`px-4 py-2 text-sm font-medium border ${
              viewType === 'edit'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewType('translate')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              viewType === 'translate'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Translate
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Render the appropriate view component based on viewType */}
        {viewType === 'preview' ? (
          <ItemPreview item={item} />
        ) : viewType === 'edit' ? (
          <ItemViewFull item={item} onItemUpdated={handleItemUpdated} />
        ) : viewType === 'translate' ? (
          <ItemTranslate item={item} onTranslationUpdated={handleItemUpdated} />
        ) : (
          <ItemViewFull item={item} onItemUpdated={handleItemUpdated} />
        )}
      </div>
    </div>
  );
};

export default ItemDetail;