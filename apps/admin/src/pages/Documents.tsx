import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenusWithPublishStatus } from '../services/websiteService';
import { MenuWithPublishStatus, MENU_TYPES } from '@sebastians/shared-types';
import { PaperSize } from '../types/documents';

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<MenuWithPublishStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for print configuration
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await getMenusWithPublishStatus();
        // Filter only for printable menus
        const printableOnes = data.filter(m => m.menu_type === MENU_TYPES.PRINTABLE && m.isActive !== false);
        setMenus(printableOnes);
      } catch (err) {
        console.error("Failed to load printable menus", err);
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  const handlePrintRedirect = (menuId: string) => {
    // Navigate to the preview with settings as search params
    navigate(`/documents/print/${menuId}?lang=${selectedLanguage}&size=${paperSize}`);
  };

  if (loading) return <div className="p-8 text-center">Loading Printable Menus...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Printable Documents</h1>
        <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-sm border">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border-none text-sm focus:ring-0"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            {/* Add more as per your supported languages */}
          </select>
          <div className="border-l h-6"></div>
          <div className="flex items-center space-x-2 text-sm px-2">
            <button 
              onClick={() => setPaperSize('A4')}
              className={`px-2 py-1 rounded ${paperSize === 'A4' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >A4</button>
            <button 
              onClick={() => setPaperSize('A3')}
              className={`px-2 py-1 rounded ${paperSize === 'A3' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >A3</button>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {menus.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No menus marked as "Printable" found.</p>
          </div>
        ) : (
          menus.map(menu => (
            <div key={menu.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border">
              <div>
                <h3 className="font-semibold text-lg">{menu.menu_name}</h3>
                <p className="text-sm text-gray-500">{menu.menu_description}</p>
              </div>
              <button 
                onClick={() => handlePrintRedirect(menu.id!)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Preview & Print
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Documents;