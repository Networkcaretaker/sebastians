// apps/menu/src/components/MenuPreview.tsx
import React from 'react';
import { MenuData } from '../services/menuService';
import ItemPreview from './ItemPreview';

interface MenuPreviewProps {
  menuData: MenuData;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ menuData }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">


      {/* Categories */}
      {menuData.categories
        .sort((a, b) => a.cat_order - b.cat_order)
        .map((category) => {
          const activeItems = category.items.filter(item => item.isActive);
          
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-4 mb-8">
              {/* Category Header */}
              <div className="flex justify-center items-center">
                <h2 className="text-3xl font-bold mb-2">{category.cat_name}</h2>
              </div>
              
              {category.cat_header && (
                <div className="flex justify-center items-center border-b pb-3 mb-3">
                  <h2 className="text-lg text-center font-bold">
                    <i>{category.cat_header}</i>
                  </h2>
                </div>
              )}
              
              {category.cat_description && (
                <div className="mb-4">
                  <p className="text-center">{category.cat_description}</p>
                </div>
              )}

              {/* Menu Items */}
              {activeItems.length > 0 ? (
                <div className="space-y-4">
                  {activeItems
                    .sort((a, b) => a.item_order - b.item_order)
                    .map((item) => (
                      <ItemPreview key={item.id} item={item} />
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
                      <span className="text-green-600 font-medium">{extra.price.toFixed(2)}€</span>
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
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 m-1 rounded text-xs">
                        {addon.item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {category.cat_footer && (
                <div className="flex justify-center items-center border-t pt-3 mt-6">
                  <h2 className="text-lg text-center font-light">
                    <i>{category.cat_footer}</i>
                  </h2>
                </div>
              )}
            </div>
          );
        })}
      
      {/* Menu Footer */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-sm text-gray-500">
          <p>End of {menuData.menu_name}</p>
          <p className="mt-2">Digital Menu</p>
          <p className="mt-2">Last updated: {new Date(menuData.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default MenuPreview;