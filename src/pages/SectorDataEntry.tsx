import React from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';

/**
 * Sektor Məlumat Daxil Etmə Səhifəsi
 * 
 * Bu səhifə yalnız sektor kateqoriyaları (assignment="sectors") üçün məlumat daxil etməyə imkan verir.
 * Səktor adminləri bu səhifədə səktor məlumatlarını idarə edirlər.
 * 
 * ✅ AYRILAN: Bu səhifə yalnız sektor məlumatları üçün
 * Məktəb məlumatları üçün /data-entry səhifəsi istifadə olunur
 */
const SectorDataEntry: React.FC = () => {
  return <DataEntryContainer assignment="sectors" />;
};

export default SectorDataEntry;
