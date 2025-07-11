// apps/menu/src/components/Footer.tsx
import React from 'react';
import { APP_CONFIG } from '../services/config';
import { useTranslation } from '../hooks/useTranslation';

const MenuFooter: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-full mx-auto space-y-8">
        {/* Menu Footer */}
        <footer className="bg-amber-400 mt-2 ">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="items-center flex justify-center">
                <img src="/Sebastian_Logo.png" className="w-36 py-4" alt="Sebastian's Logo" />
            </div>
            <div className="text-center">
                <p className="text-gray-900 mb-6">{t('thankYouMessage')}</p>
            </div>
            <div className="flex justify-center pb-8">
                <a 
                    href={APP_CONFIG.facebookURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200`}
                    >
                    {/* Facebook Icon SVG */}
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        className="flex-shrink-0"
                    >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    
                    <span className="text-xs">{t('followFacebook')}</span>
                </a>
            </div>
            <div className="text-center text-sm text-gray-600">
                <p>&copy; 2025 {APP_CONFIG.restaurantName}. All rights reserved.</p>
            </div>
            </div>
        </footer>
    </div>
  );
};

export default MenuFooter;