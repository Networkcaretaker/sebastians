import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { documentService } from '../services/documentService';

const PrintPreview: React.FC = () => {
  const { menuId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const size = searchParams.get('size') || 'A4';
  const lang = searchParams.get('lang') || 'en';

  useEffect(() => {
    const loadData = async () => {
      if (!menuId) return;
      try {
        setLoading(true);
        const json = await documentService.getMenuData(menuId);
        
        // Use the transformation logic from your website app to avoid 'undefined' errors
        const sanitizedData = {
          ...json,
          categories: (json.categories || []).map((cat: any) => ({
            ...cat,
            items: (cat.items || []).map((item: any) => ({
              ...item,
              // Use translated name if it exists for the current lang
              display_name: item.translations?.[lang]?.name || item.name || item.item_name,
              display_description: item.translations?.[lang]?.description || item.description || item.item_description,
              display_price: parseFloat(item.price || item.item_price || '0')
            }))
          }))
        };

        setData(sanitizedData);
      } catch (err: any) {
        setError("Menu not found. Has it been published yet?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [menuId, lang]);

  if (loading) return <div className="p-20 text-center font-sans">Loading {lang.toUpperCase()} Menu...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;
  
  // Guard clause: If data is null or categories missing, don't try to render
  if (!data || !data.categories) return <div className="p-20 text-center">No categories found in this menu.</div>;

  return (
    <div className="min-h-screen bg-gray-500 p-8 flex flex-col items-center print:bg-white print:p-0">
      <div className="mb-6 flex gap-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded shadow-lg font-bold"
        >
          Print {size} Menu
        </button>
      </div>

      <div className={`bg-white shadow-2xl p-[20mm] box-border print:shadow-none
          ${size === 'A3' ? 'w-[297mm] min-h-[420mm]' : 'w-[210mm] min-h-[297mm]'}`}>
        
        <header className="text-center mb-12 border-b-2 border-black pb-6">
          <h1 className="text-4xl font-bold uppercase mb-2">
            {data.restaurant?.name || "Restaurant"}
          </h1>
          <p className="text-gray-600 italic">
            {data.menu?.translations?.[lang]?.name || data.menu?.name}
          </p>
        </header>

        <div className="space-y-8">
          {data.categories.map((cat: any) => (
            <section key={cat.id || Math.random()}>
              <h2 className="text-2xl font-bold border-b border-gray-300 mb-6 uppercase tracking-wider">
                {cat.translations?.[lang]?.name || cat.name}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item: any) => (
                  <div key={item.id || Math.random()} className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold">{item.display_name}</h3>
                      <p className="text-sm text-gray-500 italic mt-1 leading-relaxed">
                        {item.display_description}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-lg">
                      €{item.display_price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: ${size} portrait; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .min-h-screen { padding: 0 !important; background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintPreview;