
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface DataEntryContainerProps {
  children?: React.ReactNode;
}

export const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('dataEntry.data_entry')}</h1>
      {children}
    </div>
  );
};

export default DataEntryContainer;
