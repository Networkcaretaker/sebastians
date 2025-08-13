// apps/menu/src/components/MenuNavigation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedMenus } from '../services/menuService';
import { PublishedMenu } from "../types/menu.types"
import { useTranslation } from '../hooks/useTranslation';
import { useAllergyVisibility } from '../contexts/AllergyVisibilityContext';
import LanguageSelector from '../components/LanguageSelector';

interface MenuNavigationProps {
  className?: string;
}

const MenuNavigation: React.FC<MenuNavigationProps> = ({ className = '' }) => {
  const { t, getMenuName, getMenuDescription } = useTranslation();
  const { menuId } = useParams<{ menuId: string }>();
  const { allergiesVisible, toggleAllergiesVisibility } = useAllergyVisibility();
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

  // Handle allergy toggle
  const handleAllergyToggle = () => {
    toggleAllergiesVisibility();
  };

  if (loading || menus.length <= 1) {
    // If only one menu or loading, show a simple back to home button
    return (
      <Link
        to="/"
        className={`bg-white hover:bg-grey-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg ${className}`}
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
        className="bg-white hover:bg-grey-100 sm:py-2 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
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
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div>
            <Link to="/">
              <div className="font-medium text-gray-800 hover:bg-gray-50 text-sm pt-4 pb-4 px-4">
                ⬅️ Home
              </div>
            </Link>
          </div>

          {/* Category List */}
          {/* TODO */}
        
          {/* Menu List */}
          <div className="">
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
            
            {/* Allergies Toggle Section */}
            <div className="flex mx-auto font-medium text-sm justify-between items-center pt-4 pb-4 border-t">
              <span className="px-4">{t('allergens')}</span>
              <button
                onClick={handleAllergyToggle}
                className={`mx-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  allergiesVisible ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={allergiesVisible}
                aria-label="Toggle allergy visibility"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allergiesVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Language Selector */}
            <div className="flex mx-auto text-xs justify-center pt-4 pb-4 border-t">
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