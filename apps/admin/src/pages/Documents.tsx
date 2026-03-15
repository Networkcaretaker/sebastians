import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenusWithPublishStatus } from '../services/websiteService';
import { MenuWithPublishStatus, MENU_TYPES } from '@sebastians/shared-types';
import { PaperSize } from '../types/documents';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
  //{ code: 'fr', label: 'FR' },
  //{ code: 'it', label: 'IT' },
  //{ code: 'nl', label: 'NL' },
  //{ code: 'pt', label: 'PT' },
];

const PRINT_CONFIG_SESSION_KEY = 'documents_print_config';

const getSessionConfig = () => {
  try {
    const stored = sessionStorage.getItem(PRINT_CONFIG_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<MenuWithPublishStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // States for print configuration — restored from sessionStorage if available
  const session = getSessionConfig();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(session?.selectedLanguage ?? 'en');
  const [paperSize, setPaperSize] = useState<PaperSize>(session?.paperSize ?? 'A4');
  const [columns, setColumns] = useState<1 | 2>(session?.columns ?? 1);
  const [spacing, setSpacing] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'>(session?.spacing ?? 'md');
  const [showAllergens, setShowAllergens] = useState<boolean>(session?.showAllergens ?? false);

  // Persist config to sessionStorage whenever any option changes
  useEffect(() => {
    try {
      sessionStorage.setItem(PRINT_CONFIG_SESSION_KEY, JSON.stringify({
        selectedLanguage, paperSize, columns, spacing, showAllergens
      }));
    } catch {
      // sessionStorage unavailable — silently ignore
    }
  }, [selectedLanguage, paperSize, columns, spacing, showAllergens]);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await getMenusWithPublishStatus();
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
    navigate(`/documents/print/${menuId}?lang=${selectedLanguage}&size=${paperSize}&columns=${columns}&spacing=${spacing}&allergens=${showAllergens}`);
  };

  if (loading) return <div className="p-8 text-center">Loading Printable Menus...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Printable Documents</h1>

        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border">

          {/* Language */}
          <div className="flex items-center space-x-1 text-sm px-2">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setSelectedLanguage(code)}
                className={`px-2 py-1 rounded text-xs font-medium ${selectedLanguage === code ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="border-l h-6" />

          {/* Paper Size */}
          <div className="flex items-center space-x-1 text-sm px-2">
            {(['A4', 'A3'] as PaperSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setPaperSize(s)}
                className={`px-2 py-1 rounded ${paperSize === s ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="border-l h-6" />

          {/* Columns */}
          <div className="flex items-center space-x-1 text-sm px-2">
            <button
              onClick={() => setColumns(1)}
              className={`px-2 py-1 rounded ${columns === 1 ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              title="1 Column"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="3" width="16" height="18" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setColumns(2)}
              className={`px-2 py-1 rounded ${columns === 2 ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              title="2 Columns"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
              </svg>
            </button>
          </div>

          <div className="border-l h-6" />

          {/* Spacing */}
          <div className="flex items-center space-x-1 text-sm px-2">
            <span className="text-gray-400 text-xs mr-1">Spacing</span>
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpacing(s)}
                className={`px-2 py-1 rounded text-xs ${spacing === s ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="border-l h-6" />

          {/* Allergens Toggle */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-400">Allergens</span>
            <button
              onClick={() => setShowAllergens(prev => !prev)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${showAllergens ? 'bg-blue-600' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={showAllergens}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${showAllergens ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
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