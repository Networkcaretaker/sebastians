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

        // 🔧 REMOVED: This was the problematic line that was resetting your custom order!
        // await menuItemService.initializeMenuOrder(categoryId);
        
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Category not found</p>
        </div>
      </div>
    );
  }

  // Filter out non-active items for preview
  const activeMenuItems = menuItems.filter(item => item.flags?.active);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/categories"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            ← Back to Categories
          </Link>
          
          {/* Category Dropdown Navigation */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              ↑↓ {category.cat_name}
              <span className="ml-2">▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <ul className="py-1 max-h-60 overflow-auto">
                  {allCategories.map((cat) => (
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