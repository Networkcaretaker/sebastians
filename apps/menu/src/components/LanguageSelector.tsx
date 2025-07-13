// apps/menu/src/components/LanguageSelector.tsx
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  showFlags?: boolean;
  showNames?: boolean;
  variant?: 'dropdown' | 'buttons';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showFlags = true,
  showNames = false,
  variant = 'dropdown'
}) => {
  const { 
    currentLanguage, 
    setLanguage, 
    availableLanguages, 
    getLanguageName, 
    getLanguageFlag 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  // Get current language display info
  const currentLangName = getLanguageName(currentLanguage);
  const currentLangFlag = getLanguageFlag(currentLanguage);

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {showFlags && <span className="mr-2">{currentLangFlag}</span>}
          {showNames && <span className="mr-2">{currentLangName}</span>}
          {!showNames && !showFlags && <span className="mr-2">{currentLanguage.toUpperCase()}</span>}
          <svg
            className={`w-5 h-5 ml-2 -mr-1 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute right-0 z-20 w-48 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      currentLanguage === language.code
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-3">{language.flag}</span>
                    <span>{language.name}</span>
                    {currentLanguage === language.code && (
                      <svg
                        className="w-5 h-5 ml-auto text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Button variant (for mobile or compact layouts)
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
              currentLanguage === language.code
                ? 'bg-blue-800 text-white border-blue-800'
                : 'bg-white text-gray-700 border-blue-600 hover:bg-blue-600 hover:text-gray-100'
            }`}
          >
            {showFlags && <span className="mr-1">{language.flag}</span>}
            {showNames ? language.name : language.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

export default LanguageSelector;