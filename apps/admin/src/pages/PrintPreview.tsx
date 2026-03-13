import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { documentService } from '../services/documentService';

const PrintPreview: React.FC = () => {
  const { menuId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Reference to the printable area
  const componentRef = useRef<HTMLDivElement>(null);

  const size = searchParams.get('size') || 'A4';
  const lang = searchParams.get('lang') || 'en';

  // React-to-print hook
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data?.restaurant?.name || 'Menu'}-${lang}`,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!menuId) return;
      try {
        setLoading(true);
        const json = await documentService.getMenuData(menuId);
        
        // Data sanitization/transformation
        const sanitizedData = {
          ...json,
          categories: (json.categories || []).map((cat: any) => ({
            ...cat,
            items: (cat.items || []).map((item: any) => ({
              ...item,
              display_name: item.translations?.[lang]?.name || item.name || item.item_name,
              display_description: item.translations?.[lang]?.description || item.description || item.item_description,
              display_price: parseFloat(item.price || item.item_price || '0')
            }))
          }))
        };
        setData(sanitizedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [menuId, lang]);

  if (loading) return <div className="p-20 text-center">Loading {lang.toUpperCase()} Menu...</div>;
  if (!data) return <div className="p-20 text-center">Menu not found.</div>;

  return (
    <div className="min-h-screen bg-gray-600 p-8 flex flex-col items-center">
      
      {/* UI Control Panel - This never prints */}
      <div className="mb-8 flex gap-4 bg-white p-4 rounded-lg shadow-xl print:hidden">
        <button 
          onClick={() => handlePrint()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-bold uppercase tracking-tight"
        >
          🖨️ Print {size} Menu
        </button>
        <div className="flex items-center text-sm text-gray-500 px-4 border-l">
          <p>Format: <strong>{size}</strong> | Language: <strong>{lang.toUpperCase()}</strong></p>
        </div>
      </div>

      {/* The Printable Paper - Attached to componentRef */}
      <div 
        ref={componentRef}
        className={`bg-white shadow-2xl p-[15mm] md:p-[20mm] box-border
          ${size === 'A3' ? 'w-[297mm] min-h-[420mm]' : 'w-[210mm] min-h-[297mm]'}`}
      >

        <div className="space-y-12">
          {data.categories.map((cat: any) => (
            <section key={cat.id || Math.random()} className="break-inside-avoid">

              <h2 className="text-2xl text-center font-bold border-b-2 border-black mb-6 uppercase tracking-widest pb-1">
                {cat.translations?.[lang]?.name || cat.name}
              </h2>

              <div className="space-y-2">
                {cat.items.map((item: any) => (
                  <div key={item.id || Math.random()} className="flex justify-between items-start gap-10">
                    <div className="flex-grow">
                      <h3 className="text-md font-bold uppercase">{item.display_name}</h3>
                      <p className="text-xs text-gray-600 italic mt-1 leading-snug">
                        {item.display_description}
                      </p>
                    </div>
                    <div className="font-bold text-md whitespace-nowrap">
                      € {item.display_price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Optional Footer for VAT/IVA (Common in Mallorca) */}
        <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>IVA incluido / VAT included</p>
          <p className="mt-1">{data.restaurant?.name} - {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* Internal Print CSS Injection */}
      <style>{`
        @media print {
          @page { 
            size: ${size === 'A3' ? 'A3' : 'A4'} portrait; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact; 
          }
          /* This ensures your categories don't get split awkwardly across two pages */
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPreview;