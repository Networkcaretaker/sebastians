// src/pages/ItemDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuItem } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import ItemViewFull from '../components/ItemViewFull';
import ItemPreview from '../components/ItemPreview';

// View options type
type ViewType = 'style' | 'full';

const ItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [_allItems, setAllItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('style');
  const { currentUser } = useAuth();
  //const navigate = useNavigate();

  // Fetch all Items for the dropdown
  useEffect(() => {
    if (currentUser) {
      const fetchAllItems = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'menu_items'));
          const itemsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MenuItem[];
          
          setAllItems(itemsData);
        } catch (err) {
          console.error('Error fetching items:', err);
        }
      };
      
      fetchAllItems();
    }
  }, [currentUser]);

  // Fetch current Item and its items
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view Item details');
      return;
    }

    if (!itemId) {
      setLoading(false);
      setError('Item ID is missing');
      return;
    }

    const fetchItems = async () => {
      try {
        // Fetch the item
        const itemDoc = await getDoc(doc(db, 'menu_items', itemId));
        
        if (!itemDoc.exists()) {
          setError('Item not found');
          setLoading(false);
          return;
        }
        
        const itemData = {
          id: itemDoc.id,
          ...itemDoc.data()
        } as MenuItem;
        
        setItem(itemData);
        
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    // Close dropdown when changing items
  }, [itemId, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            onClick={() => setViewType('style')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              viewType === 'style'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setViewType('full')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              viewType === 'full'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Edit
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Render the appropriate view component based on viewType */}
        {viewType === 'style' ? (
            <ItemPreview item={item} />
        ) : (
            <ItemViewFull item={item} />
        )}
      </div>
    </div>
  );
};

export default ItemDetail;