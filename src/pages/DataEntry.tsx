
import React from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

/**
 * Məktəb Məlumat Daxil Etmə Səhifəsi
 * 
 * Bu səhifə istifadəçilərə icazələrinə əsasən məktəb kateqoriyaları üçün məlumat daxil etməyə imkan verir.
 * Məktəb istifadəçiləri üçün öz məktəbləri ilə əlaqəli kateqoriyaları göstərir.
 * Sektor adminləri üçün məktəb seçməyə və o məktəb üçün məlumat daxil etməyə imkan verir.
 * 
 * ✅ DƏYIŞDİ: İndi yalnız məktəb kateqoriyalarını göstərir
 */
const DataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  
  // Sektor adminləri artıq /sector-data-entry istifadə edir
  // Bu səhifə yalnız məktəb məlumatları üçün
  
  return <DataEntryContainer assignment="schools" />;
};

export default DataEntry;
