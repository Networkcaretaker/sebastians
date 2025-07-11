// apps/menu/src/components/AllergyIcon.tsx
import React from 'react';
import { getAllergyIcon } from '../utils/allergyIcons';
import { useTranslation } from '../hooks/useTranslation';

interface AllergyIconProps {
  allergy: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AllergyIcon: React.FC<AllergyIconProps> = ({ 
  allergy, 
  className = '',
  showText = false,
  size = 'md'
}) => {
  const { getAllergyName, t } = useTranslation();
  const iconUrl = getAllergyIcon(allergy);
  const translatedName = getAllergyName(allergy);
  
  // Size mapping for consistent sizing
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!iconUrl) {
    // Fallback to text if no icon is found
    return (
      <span 
        className={`inline-flex items-center ${className}`}
        title={`${t('allergens')} ${translatedName}`}
        aria-label={`${t('allergens')} ${translatedName}`}
      >
        {translatedName}
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 ${className}`}
      title={`${t('allergens')} ${translatedName}`}
      aria-label={`${t('allergens')} ${translatedName}`}
    >
      <img 
        src={iconUrl}
        alt={translatedName}
        className={`${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {showText && (
        <span className="text-xs">{translatedName}</span>
      )}
    </span>
  );
};

export default AllergyIcon;