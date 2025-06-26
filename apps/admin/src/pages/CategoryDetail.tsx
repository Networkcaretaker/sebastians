// src/pages/CategoryDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuCategory, MenuItem } from '../types/menu.types';
import { useAuth } from '../context/AuthContext';
import CategoryViewFull from '../components/CategoryViewFull';
import CategoryPreview from '../components/CategoryPreview';
import CategorySort from '../components/CategorySort';
import menuItemService from '../services/menuItemService';

// View options type
type ViewType = 'preview' | 'edit' | 'order';

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('preview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orderChanged, setOrderChanged] = useState(false);

  // Fetch all categories for the dropdown
  useEffect(() => {
    if (currentUser) {
      const fetchAllCategories = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'categories'));
          const categoriesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MenuCategory[];
          
          setAllCategories(categoriesData);
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      };
      
      fetchAllCategories();
    }
  }, [currentUser]);

  // Fetch current category and its items
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view category details');
      return;
    }

    if (!categoryId) {
      setLoading(false);
      setError('Category ID is missing');
      return;
    }

    const fetchCategoryAndItems = async () => {
      try {
        // Fetch the category
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        
        if (!categoryDoc.exists()) {
          setError('Category not found');
          setLoading(false);
          return;
        }
        
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data()
        } as MenuCategory;
        
        setCategory(categoryData);

        // Initialize menu_order for items if needed
        await menuItemService.initializeMenuOrder(categoryId);
        
        // Fetch all menu items associated with this category
        const itemIds = categoryData.items || [];
        
        if (itemIds.length > 0) {
          const itemsData: MenuItem[] = [];
          
          // Fetch each item by ID
          for (const itemId of itemIds) {
            const itemDoc = await getDoc(doc(db, 'menu_items', itemId));
            
            if (itemDoc.exists()) {
              itemsData.push({
                id: itemDoc.id,
                ...itemDoc.data()
              } as MenuItem);
            }
          }
          
          setMenuItems(itemsData);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('Error fetching category details:', err);
        setError('Failed to load category details');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndItems();
    // Close dropdown when changing categories
    setIsDropdownOpen(false);
  }, [categoryId, currentUser]);

  // Handler for selecting a category from the dropdown
  const handleCategorySelect = (selectedCategoryId: string) => {
    if (selectedCategoryId !== categoryId) {
      navigate(`/categories/${selectedCategoryId}`);
    }
    setIsDropdownOpen(false);
  };

  // Add a function to refresh the menu items
  const refreshMenuItems = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      
      // Fetch all menu items associated with this category
      const itemIds = category?.items || [];
      
      if (itemIds.length > 0) {
        const itemsData: MenuItem[] = [];
        
        // Fetch each item by ID
        for (const itemId of itemIds) {
          const itemDoc = await getDoc(doc(db, 'menu_items', itemId));
          
          if (itemDoc.exists()) {
            itemsData.push({
              id: itemDoc.id,
              ...itemDoc.data()
            } as MenuItem);
          }
        }
        
        setMenuItems(itemsData);
      } else {
        setMenuItems([]);
      }
    } catch (err) {
      console.error('Error refreshing menu items:', err);
    } finally {
      setLoading(false);
    }
  };
  // In the useEffect that tracks orderChanged
  useEffect(() => {
    if (orderChanged) {
      refreshMenuItems();
      setOrderChanged(false);
    }
  }, [orderChanged, categoryId]);

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
          to="/categories" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Category not found</p>
        </div>
        <Link 
          to="/categories" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Categories
        </Link>
      </div>
    );
  }

  // Filter active items for preview
  const activeMenuItems = menuItems.filter(item => item.flags && item.flags.active);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-2 md:mb-0">
          <Link 
            to="/categories" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            ← Back to Categories
          </Link>
          
          {/* Category Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <span className="truncate">-- {category.cat_name} --</span>
              <svg 
                className={`w-4 h-4 ml-2 transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-56 mt-1 bg-white rounded-md shadow-lg">
                <ul className="py-1 overflow-auto max-h-60">
                  {allCategories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategorySelect(cat.id!)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          cat.id === categoryId 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat.cat_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* View Type Toggle */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setViewType('preview')}
            className={`px-4 py-2 text-sm font-medium border ${
              viewType === 'preview'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${viewType === 'order' ? 'rounded-l-lg' : viewType === 'edit' ? 'rounded-l-lg' : 'rounded-l-lg'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setViewType('order')}
            className={`px-4 py-2 text-sm font-medium border ${
              viewType === 'order'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${viewType === 'preview' ? 'rounded-none' : viewType === 'order' ? 'rounded-none' : 'rounded-none'}`}
          >
            Sort
          </button>
          <button
            onClick={() => setViewType('edit')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              viewType === 'edit'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Render the appropriate view component based on viewType */}
      {viewType === 'preview' ? (
        <CategoryPreview category={category} menuItems={activeMenuItems} />
      ) : viewType === 'order' ? (
        <CategorySort category={category} menuItems={menuItems} onOrderSaved={() => setOrderChanged(true)} />
      ) : (
        <CategoryViewFull category={category} menuItems={menuItems} />
      )}
    </div>
  );
};

export default CategoryDetail;