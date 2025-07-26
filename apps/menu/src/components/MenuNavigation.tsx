// apps/menu/src/components/MenuNavigation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedMenus, PublishedMenu } from '../services/menuService';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';

interface MenuNavigationProps {
  className?: string;
}

const MenuNavigation: React.FC<MenuNavigationProps> = ({ className = '' }) => {
  const { getMenuName, getMenuDescription } = useTranslation();
  const { menuId } = useParams<{ menuId: string }>();
  const [menus, setMenus] = useState<PublishedMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<PublishedMenu | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load available menus
  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      try {
        const publishedMenus = await getPublishedMenus();
        setMenus(publishedMenus);
        
        // Find current menu
        const current = publishedMenus.find(menu => menu.id === menuId);
        setCurrentMenu(current || null);
      } catch (error) {
        console.error('Error loading menus:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, [menuId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle menu selection
  const handleMenuSelect = () => {
    setIsOpen(false);
  };

  if (loading || menus.length <= 1) {
    // If only one menu or loading, show a simple back to home button
    return (
      <Link
        to="/"
        className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg ${className}`}
      >
        ← Home
      </Link>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white hover:bg-grey-100 sm:py-2 text-grey-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Menu Icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="hidden sm:inline text-sm">
          {currentMenu ? getMenuName(currentMenu) : 'Select Menu'}
        </span>
        {/* Chevron Down Icon */}
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="font-medium text-sm pt-4 pb-2 px-4">
            <Link
                to="/"
            >
                ⬅️ Home
            </Link>
          </div>  
          {/* Menu List */}
          <div className="py-2">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                to={`/menu/${menu.id}`}
                onClick={handleMenuSelect}
                className={`block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                  menu.id === menuId 
                    ? 'bg-blue-50 border-r-2 border-blue-500' 
                    : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-medium text-sm ${
                    menu.id === menuId 
                      ? 'text-blue-700' 
                      : 'text-gray-900'
                  }`}>
                    {getMenuName(menu)}
                  </span>
                  {menu.description && (
                    <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {getMenuDescription(menu)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <div className="flex mx-auto text-xs justify-center pt-4 pb-2 border-t">
              <LanguageSelector 
                variant="buttons" 
                showFlags={true}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuNavigation;