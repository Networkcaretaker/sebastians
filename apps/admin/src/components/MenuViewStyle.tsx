// src/components/MenuViewStyle.tsx
import React, { useState, useEffect } from 'react';
import { Menu, MenuCategory, MenuItem } from '../types/menu.types';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ItemViewStyle from './ItemViewStyle';

interface MenuViewStyleProps {
  menu: Menu;
}

const MenuViewStyle: React.FC<MenuViewStyleProps> = ({ menu }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoryItems, setCategoryItems] = useState<{ [categoryId: string]: MenuItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!menu.categories || menu.categories.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch categories in the correct order from menu.categories array
        const categoriesData: MenuCategory[] = [];
        
        for (const categoryId of menu.categories) {
          const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
          
          if (categoryDoc.exists()) {
            const categoryData = {
              id: categoryDoc.id,
              ...categoryDoc.data()
            } as MenuCategory;
            
            categoriesData.push(categoryData);
          }
        }
        
        setCategories(categoriesData);

        // Fetch items for each category
        const allCategoryItems: { [categoryId: string]: MenuItem[] } = {};
        
        for (const category of categoriesData) {
          if (category.items && category.items.length > 0) {
            const itemsData: MenuItem[] = [];
            
            // Fetch each item by ID
            for (const itemId of category.items) {
              const itemDoc = await getDoc(doc(db, 'menu_items', itemId));
              
              if (itemDoc.exists()) {
                const itemData = {
                  id: itemDoc.id,
                  ...itemDoc.data()
                } as MenuItem;
                
                // Only include active items for the preview
                if (itemData.flags && itemData.flags.active) {
                  itemsData.push(itemData);
                }
              }
            }
            
            // Sort items by menu_order
            itemsData.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
            allCategoryItems[category.id!] = itemsData;
          } else {
            allCategoryItems[category.id!] = [];
          }
        }
        
        setCategoryItems(allCategoryItems);
        
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [menu]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading menu preview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{menu.menu_name}</h3>
          <p className="text-gray-500">No categories assigned to this menu.</p>
          <p className="text-sm text-gray-400 mt-2">
            Add categories to this menu to see the preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Menu Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-3xl font-bold mb-2">{menu.menu_name}</h1>
          {menu.menu_description && (
            <p className="text-lg text-gray-600 italic">{menu.menu_description}</p>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Menu Preview • {categories.length} Categories</p>
        </div>
      </div>

      {/* Categories and Items */}
      {categories.map((category) => {
        const items = categoryItems[category.id!] || [];
        
        return (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-4 mb-8">
            {/* Category Header */}
            <div className="flex justify-center items-center">
              <h2 className="text-3xl font-bold mb-2">{category.cat_name}</h2>
            </div>
            
            {category.header && (
              <div className="flex justify-center items-center border-b pb-3 mb-3">
                <h2 className="text-lg text-center font-bold">
                  <i>{category.header}</i>
                </h2>
              </div>
            )}
            
            {category.cat_description && (
              <div className="mb-4">
                <p className="text-center">{category.cat_description}</p>
              </div>
            )}

            {/* Menu Items */}
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map(item => (
                  <ItemViewStyle key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded text-center">
                <p className="text-gray-500">No active items in this category.</p>
              </div>
            )}
            
            {/* Category Extras */}
            {category.extras && category.extras.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold pb-2">{category.cat_name} Extras</h3>
                {category.extras.map((extra, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-base font-base px-4">{extra.item}</span>
                    <span className="text-green-600 font-medium">${extra.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Category Add-ons */}
            {category.addons && category.addons.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-bold pb-2">{category.cat_name} Add-ons</h3>
                <div className="flex flex-wrap">
                  {category.addons.map((addon, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 m-1 rounded text-xs font-basel">
                      {addon.item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {category.footer && (
              <div className="flex justify-center items-center border-t pt-3 mt-6">
                <h2 className="text-lg text-center font-light">
                  <i>{category.footer}</i>
                </h2>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Menu Footer */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-sm text-gray-500">
          <p>End of {menu.menu_name}</p>
          <p className="mt-2">
            {menu.menu_type === 'web' ? 'Digital Menu Preview' : 'Printable Menu Preview'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuViewStyle;