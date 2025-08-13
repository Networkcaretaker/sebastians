// apps/menu/src/components/ItemPreview.tsx
import React from 'react';
import AllergyIcon from './AllergyIcon';
import { useTranslation } from '../hooks/useTranslation';
import { APP_CONFIG, THEME_CONFIG } from '../services/config';
import { useAllergyVisibility } from '../contexts/AllergyVisibilityContext';
import { MenuItem } from "../types/menu.types"

interface ItemPreviewProps {
  item: MenuItem;
}

const ItemPreview: React.FC<ItemPreviewProps> = ({ item }) => {
  const { getItemName, getItemDescription, getOptionText, getExtraText, getAddonText, t } = useTranslation();
  const { allergiesVisible } = useAllergyVisibility();

  // Temporary debugging for addons and extras
  if (APP_CONFIG.isDevelopment) {
    console.log('Item:', item.item_name);
    console.log('Item translations:', item.translations);
    if (item.addons && item.addons.length > 0) {
      console.log('Item addons:', item.addons);
    }
    if (item.extras && item.extras.length > 0) {
      console.log('Item extras:', item.extras);
    }
  };
  
  return (
    <div className="border-b py-4">
      <div className="">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <h3 className={`${THEME_CONFIG.itemText} text-base font-bold`}>{getItemName(item)}</h3>
          </div>

          {item.item_price > 0 
            ? <div>
                {item.hasOptions || (item.options && item.options.length > 0) ? (
                <div className={`${THEME_CONFIG.priceText} min-w-16 text-end text-base font-bold`}>
                  <span className="text-xs font-medium px-1">{t('from')}</span>{item.item_price.toFixed(2)} €
                </div>
              ) : (
                <div>
                  <div className={`${THEME_CONFIG.priceText} min-w-16 text-end text-base font-bold`}>{item.item_price.toFixed(2)} €</div>
                </div>
              )}
            </div> 
            : <div>
                <div className={`${THEME_CONFIG.priceText} min-w-16 text-end text-base font-bold`}>
                  {item.options && item.options.length > 0 && (
                    <div>
                      {item.options.map((option, idx) => (
                        <div key={idx} className="text-base">
                          <span className={`${THEME_CONFIG.priceText} text-xs font-medium px-2`}>{getOptionText(item, idx, option.option)}</span>
                          <span className={`${THEME_CONFIG.priceText} font-bold min-w-16 text-end`}>
                             {option.price.toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="">
          <p className={`${THEME_CONFIG.descriptionText} text-sm`}>{getItemDescription(item)}</p>
        </div>

        {/* Add-ons */}
        {item.addons && item.addons.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {item.addons.map((addon, idx) => (
              <span key={idx} className={`text-xs ${THEME_CONFIG.addonColor.background} ${THEME_CONFIG.addonColor.text} px-2 py-1 rounded`}>
                {getAddonText(item, idx, addon.item)}
              </span>
            ))}
          </div>
        )}
        
        {/* Options */}
        {item.options && item.options.length > 0 && item.item_price > 0 && (
          <div className="mt-2 space-y-1"> 
            <h4 className={`text-xs font-medium ${THEME_CONFIG.themeText}`}>{t('options')}</h4>
            {item.options.map((option, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className={`${THEME_CONFIG.descriptionText}`}>{getOptionText(item, idx, option.option)}</span>
                <span className={`${THEME_CONFIG.priceText} font-bold min-w-16 text-end text-sm`}>{option.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Extras */}
        {item.extras && item.extras.length > 0 && (
          <div className="mt-2 space-y-1">
            <h4 className={`text-xs font-medium ${THEME_CONFIG.themeText}`}>{t('extras')}</h4>
            {item.extras.map((extra, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className={`${THEME_CONFIG.descriptionText}`}>{getExtraText(item, idx, extra.item)}</span>
                <span className={`${THEME_CONFIG.priceText} font-bold min-w-16 text-end`}>+ {extra.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}

        {/* Notice Flags */}
        {item.vegetarian && (
          <div className="flex text-center mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {t('vegetarian')}
            </span>
          </div>
        )}
        {item.vegan && (
          <div className="flex text-center mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {t('vegan')}
            </span>
          </div>
        )}
        {item.spicy && (
          <div className="flex text-center mt-2">
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              {t('spicy')}
            </span>
          </div>
        )}
        
        {/* Allergies Section - Updated with Icons */}
        {allergiesVisible && item.allergies && item.allergies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <h4 className={`text-xs font-medium ${THEME_CONFIG.themeText}`}>{t('allergens')}</h4>
            <div className="flex flex-wrap gap-1">
              {item.allergies.map((allergy, idx) => (
                <span 
                  key={idx} 
                  className={`inline-flex items-center gap-1 text-xs ${THEME_CONFIG.themeColor} px-1 py-1 rounded font-medium`}
                >
                  <AllergyIcon 
                    allergy={allergy} 
                    size="sm"
                  />
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemPreview;