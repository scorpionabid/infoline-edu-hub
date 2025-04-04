
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Plus } from 'lucide-react';

export interface RegionHeaderProps {
  t: (key: string) => string;
  onAddRegion: () => void;
}

const RegionHeader: React.FC<RegionHeaderProps> = ({ t, onAddRegion }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 className="text-2xl font-bold tracking-tight mb-2 sm:mb-0">{t('regions')}</h1>
      <Button onClick={onAddRegion}>
        <Plus className="mr-2 h-4 w-4" /> {t('addRegion')}
      </Button>
    </div>
  );
};

export default RegionHeader;
