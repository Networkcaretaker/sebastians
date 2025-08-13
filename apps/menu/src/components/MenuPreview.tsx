// apps/menu/src/components/MenuPreview.tsx
import React from 'react';
import { MenuData } from "../types/menu.types"

import ItemPreview from './ItemPreview';
import { useTranslation } from '../hooks/useTranslation';
import { THEME_CONFIG, APP_CONFIG } from '../services/config';

interface MenuPreviewProps {
  menuData: MenuData;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ menuData }) => {
  const { t, getCategoryName, getCategoryHeader, getCategoryFooter, getCategoryDescription, getCategoryExtraText, getCategoryAddonText } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">

      {/* Categories */}
      {menuData.categories
        .sort((a, b) => a.cat_order - b.cat_order)
        .map((category) => {
          const activeItems = category.items.filter(item => item.isActive);
          
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md">
              {/* Category Header */}
              <div className={`${THEME_CONFIG.themeColor} rounded-t-lg p-4`}>
                <div className="flex justify-center items-center">
                  <h2 className={`${THEME_CONFIG.categoryText} text-3xl font-light uppercase`}>{getCategoryName(category)}</h2>
                </div>
                <div className="flex justify-center items-center">
                  {category.cat_header && (
                    <h2 className={`${THEME_CONFIG.headText} text-base text-center font-medium`}>
                      <i>{getCategoryHeader(category)}</i>
                    </h2>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="border-b pb-4">
                  {category.image.largeUrl && APP_CONFIG.showImage && (
                    <div>
                      <img 
                        src={category.image.largeUrl}
                        alt={category.cat_name}
                        className="w-full h-60 object-cover"
                      />
                    </div>
                  )}
                  
                  {category.cat_description && (
                    <div className="pt-2">
                      <p className={`${THEME_CONFIG.descriptionText} text-center`}>{getCategoryDescription(category)}</p>
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                {activeItems.length > 0 ? (
                  <div className="">
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
                    <h3 className={`text-base font-bold pb-2 ${THEME_CONFIG.themeText}`}>{getCategoryName(category)}: {t("extras")}</h3>
                    {category.extras.map((extra, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className={`${THEME_CONFIG.descriptionText} text-sm`}>{getCategoryExtraText(category, idx, extra.item)}</span>
                        <div className="min-w-16 text-end">
                          <span className={`${THEME_CONFIG.priceText} text-sm font-bold`}>+ {extra.price.toFixed(2)} €</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Category Add-ons */}
                {category.addons && category.addons.length > 0 && (
                  <div className="mt-4">
                    <h3 className={`text-base font-bold pb-2 ${THEME_CONFIG.themeText}`}>{getCategoryName(category)}: {t("addons")}</h3>
                    <div className="flex flex-wrap">
                      {category.addons.map((addon, idx) => (
                        <span key={idx} className={`${THEME_CONFIG.addonColor.background} ${THEME_CONFIG.addonColor.text} px-2 py-1 m-1 rounded text-xs`}>
                          {getCategoryAddonText(category, idx, addon.item)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {category.cat_footer && (
                  <div className="flex justify-center items-center border-t pt-3 mt-6">
                    <h2 className={`${THEME_CONFIG.footText} text-base text-center font-light`}>
                      <i>{getCategoryFooter(category)}</i>
                    </h2>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MenuPreview;