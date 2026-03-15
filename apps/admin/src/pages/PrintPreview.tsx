import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { documentService } from '../services/documentService';
import AllergyLegend from '../components/AllergyLegend';

const PREDEFINED_ALLERGIES: string[] = [
  'Celery', 'Corn', 'Dairy', 'Eggs', 'Fish', 'Gluten', 'Lupin',
  'Milk', 'Molluscs', 'Mustard', 'Nuts', 'Peanuts', 'Propolis',
  'Sesame', 'Shellfish', 'Soya', 'Sulphites', 'Wheat'
];

const PrintPreview: React.FC = () => {
  const { menuId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const showAllergens = searchParams.get('allergens') === 'true';
  
  const componentRef = useRef<HTMLDivElement>(null);
  const size = searchParams.get('size') || 'A4';
  const lang = searchParams.get('lang') || 'en';
  const columns = parseInt(searchParams.get('columns') || '1', 10) as 1 | 2;
  const spacing = searchParams.get('spacing') || 'md';

  const spacingMap: Record<string, { category: string; item: string }> = {
    xs:  { category: 'space-y-4',  item: 'gap-y-1' },
    sm:  { category: 'space-y-6',  item: 'gap-y-2' },
    md:  { category: 'space-y-8',  item: 'gap-y-3' },
    lg:  { category: 'space-y-10', item: 'gap-y-4' },
    xl:  { category: 'space-y-11', item: 'gap-y-5' },
    '2xl': { category: 'space-y-12', item: 'gap-y-6' },
    '3xl': { category: 'space-y-12', item: 'gap-y-7' },
    '4xl': { category: 'space-y-14', item: 'gap-y-8' },
  };
  const { category: categorySpacing, item: itemSpacing } = spacingMap[spacing] ?? spacingMap['md'];

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data?.restaurant?.name || 'Menu'}-${menuId}-${lang}`,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!menuId) return;
      try {
        setLoading(true);
        const json = await documentService.getMenuData(menuId);
        
        // Data transformation logic
        const sanitizedData = {
          ...json,
          categories: (json.categories || [])
            .sort((a: any, b: any) => (a.cat_order || 0) - (b.cat_order || 0))
            .map((cat: any) => ({
              ...cat,
              display_name: cat.translations?.[lang]?.name || cat.name,
              display_header: cat.translations?.[lang]?.header || cat.header,
              display_footer: cat.translations?.[lang]?.footer || cat.footer,
              // Map Category Addons & Extras (Relative prices)
              category_addons: (cat.addons || []).map((addon: any, idx: number) => ({
                text: cat.translations?.[lang]?.addons?.[idx] || addon.item
              })),
              category_extras: (cat.extras || []).map((extra: any, idx: number) => ({
                text: cat.translations?.[lang]?.extras?.[idx] || extra.item,
                price: extra.price
              })),
              items: (cat.items || [])
                .filter((item: any) => item.isActive !== false)
                .map((item: any) => {
                  const hasOptions = item.options && item.options.length > 0;
                  const basePrice = item.item_price || item.price || 0;
                  
                  return {
                    ...item,
                    display_name: item.translations?.[lang]?.name || item.item_name || item.name,
                    display_description: item.translations?.[lang]?.description || item.item_description || item.description,
                    display_price: basePrice,
                    show_from: hasOptions && basePrice > 0,
                    // Filter and map Options (Absolute prices)
                    display_options: (item.options || [])
                      .filter((opt: any) => opt.price > 0)
                      .map((opt: any, idx: number) => ({
                        text: item.translations?.[lang]?.options?.[idx] || opt.option,
                        price: opt.price
                      })),
                    // Map Item Addons (Simple text)
                    display_addons: (item.addons || []).map((addon: any, idx: number) => ({
                      text: item.translations?.[lang]?.addons?.[idx] || addon.item
                    })),
                    // Map Item Extras (Relative prices)
                    display_extras: (item.extras || []).map((extra: any, idx: number) => ({
                      text: item.translations?.[lang]?.extras?.[idx] || extra.item,
                      price: extra.price
                    }))
                  };
                })
            }))
        };
        
        setData(sanitizedData);
      } catch (err) {
        console.error("Failed to load menu data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [menuId, lang]);

  if (loading) return <div className="p-10 text-center">Loading Preview...</div>;
  if (!data) return <div className="p-10 text-center">Menu not found.</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* Control Bar */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 mb-8 flex justify-between items-center px-8 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Print Preview</h1>
          <p className="text-sm text-gray-500">Language: <span className="uppercase font-semibold">{lang}</span> | Size: {size} | Columns: {columns} | Spacing: {spacing}</p>
        </div>
        <button 
          onClick={() => handlePrint()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print Menu
        </button>
      </div>

      {/* Printable Area */}
      <div 
        ref={componentRef}
        className={`bg-white mx-auto shadow-2xl print:shadow-none p-10 pt-16 ${size === 'A3' ? 'w-[297mm] min-h-[420mm]' : 'w-[210mm] min-h-[297mm]'}`}
      >

        <div
          className={categorySpacing}
          style={columns === 2 ? { columnCount: 2, columnGap: '2rem' } : undefined}
        >
          {data.categories.map((category: any) => (
            <section key={category.id} className="break-inside-avoid">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold uppercase border-b-2 border-black inline-block pb-1 px-4 mb-2">
                  {category.display_name}
                </h2>
                {category.display_header && (
                  <p className="text-sm text-gray-500 italic max-w-lg mx-auto leading-relaxed">
                    {category.display_header}
                  </p>
                )}
              </div>

              <div className={`flex flex-col ${itemSpacing}`}>
                {category.items.map((item: any) => (
                  <div key={item.id} className="flex flex-col ">
                    <div className="flex justify-between items-start">
                      <h3 className="text-md font-bold uppercase leading-tight">
                        {item.display_name}
                        {/* Vegiterian */} 
                        {item.flags.vegetarian === true && (<span className="ml-1 text-xs">🌿</span>)}
                        {/* Spicey */}
                        {item.flags.spicy === true && (<span className="ml-1 text-xs">🌶</span>)}
                        {/* Allergies*/} 
                        {(item.allergies || [])
                          .map((a: string) => PREDEFINED_ALLERGIES.indexOf(a) + 1)
                          .filter((n: number) => n > 0)
                          .sort((a: number, b: number) => a - b)
                          .map((n: number) => (
                            <span key={n} className="ml-2 text-[10px] font-bold text-orange-500 leading-tight">
                              {n}
                            </span>
                          ))
                        }
                      </h3>
                      {item.display_price > 0 ? (
                        // Case 1: Item has a base price — show it, with "from" prefix if options exist
                        <div className="font-bold text-md whitespace-nowrap ml-4">
                          {item.show_from && <span className="text-xs font-normal lowercase mr-1">from</span>}
                          <span className="text-sm mr-1">€</span>{item.display_price.toFixed(2)}
                        </div>
                      ) : item.display_options.length > 0 ? (
                        // Case 2: No base price but has options — show options inline in the price area
                        <div className="flex flex-col items-end ml-4 gap-y-0.5">
                          {item.display_options.map((opt: any, i: number) => (
                            <div key={i} className="font-bold text-md whitespace-nowrap">
                              <span className="text-xs font-normal mr-1">{opt.text}</span><span className="text-sm mr-1">€</span>{opt.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    
                    {item.display_description && (
                      <p className="text-xs text-gray-600 italic leading-snug">
                        {item.display_description}
                      </p>
                    )}

                    {/* Item Options (Absolute Prices) — only shown below when item has a base price */}
                    {item.show_from && item.display_options.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {item.display_options.map((opt: any, i: number) => (
                          <span key={i} className="text-xs text-gray-700 font-medium">
                            {opt.text}: <span className="text-sm font-normal lowercase mr-1">€</span>{opt.price.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Item Addons & Extras (Relative Prices) */}
                    {(item.display_addons.length > 0 || item.display_extras.length > 0) && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        {item.display_addons.map((addon: any, i: number) => (
                          <span key={`a-${i}`} className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">
                            {addon.text}
                          </span>
                        ))}
                        {item.display_extras.map((extra: any, i: number) => (
                          <span key={`e-${i}`} className="text-xs font-semibold text-gray-800">
                            + {extra.text} (€{extra.price.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Category Footer Addons & Extras (Matching Website) */}
              
                {(category.category_addons.length > 0 || category.category_extras.length > 0) && (
                  <div className="mt-4 pt-2 border-t border-b border-dashed border-gray-200">
                  <div className="mb-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-widest text-center">
                      Options & Sides
                    </h4>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {category.category_addons.map((addon: any, i: number) => (
                        <span key={i} className="text-[11px] text-gray-700">+ {addon.text}</span>
                      ))}
                      {category.category_extras.map((extra: any, i: number) => (
                        <span key={i} className="text-[11px] text-gray-700">
                          {extra.text} <span className="font-bold">+€{extra.price.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  </div>
                )}
                
                {/*category.display_footer && (
                  <div className="text-center text-xs text-gray-400 italic">
                    {category.display_footer}
                  </div>
                )*/}
  
            </section>
          ))}
          {showAllergens && <AllergyLegend lang={lang} />}
        </div>
        
      </div>

      <style>{`
        @media print {
          @page { 
            size: ${size === 'A3' ? 'A3' : 'A4'} portrait; 
            margin: 10mm; 
          }
          body { margin: 0; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default PrintPreview;