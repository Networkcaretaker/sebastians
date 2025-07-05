// In CategoryPreview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory, MenuItem } from '../types/menu.types';
import ItemPreview from './ItemPreview';

interface CategoryPreviewProps {
  category: MenuCategory;
  menuItems: MenuItem[];
}

const CategoryPreview: React.FC<CategoryPreviewProps> = ({ category, menuItems }) => {
  // Sort the items by menu_order before rendering
  const sortedMenuItems = [...menuItems].sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  
  return (
    <>
      {/* Category Details Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex justify-center items-center">
          <h2 className="text-3xl font-bold mb-2">{category.cat_name}</h2>
        </div>
        <div className="flex justify-center items-center border-b pb-3 mb-3">
          <h2 className="text-lg text-center font-bold"><i>{category.header}</i></h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="mt-1">{category.cat_description}</p>
          </div>

          {/* Menu Items Section - Now using sortedMenuItems instead of menuItems */}
          {sortedMenuItems.length > 0 ? (
            <div className="">
              {sortedMenuItems.map(item => (
                <ItemPreview key={item.id} item={item} showTranslationHeader={false} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-500">No menu items in this category.</p>
              <Link 
                to="/menu-items" 
                className="inline-flex items-center mt-2 text-blue-500 hover:text-blue-700"
              >
                Add items to this category →
              </Link>
            </div>
          )}
          
          {/* Extras */}
          <div>
            {category.extras && category.extras.length > 0 ? (
              <div className="mt-2">
                <h3 className="text-xl font-bold pb-2">{category.cat_name} Extras</h3>
                {category.extras.map((extra, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-base font-base px-4">{extra.item}</span>
                    <span className="text-green-600 font-medium">{extra.price.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            ):''}
          </div>
          
          {/* Add-ons */}
          <div>
            {category.addons && category.addons.length > 0 ? (
              <div className="gap-2 my-2">
                <h3 className="text-xl font-bold pb-2">{category.cat_name} Add-ons</h3>
                <div className="flex flex-wrap">
                  {category.addons.map((addon, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 m-1 rounded text-xs font-basel">
                      {addon.item}
                    </span>
                  ))}
                </div>
              </div>
            ):''}
          </div>

          <div className="flex justify-center items-center border-t pt-3 mt-3">
            <h2 className="text-lg text-center font-light"><i>{category.footer}</i></h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPreview;