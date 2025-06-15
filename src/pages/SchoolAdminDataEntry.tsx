
import React from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

/**
 * Məktəb Admin Məlumat Daxil Etmə Səhifəsi
 * 
 * Bu səhifə məktəb adminləri üçün məxsus məlumat daxil etmə interfeysidir.
 * Yalnız assignment="all" olan kateqoriyaları göstərir.
 * Sektor kateqoriyaları (assignment="sectors") gizlənir.
 */
const SchoolAdminDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  
  // Məktəb adminləri üçün yalnız 'all' assignment-li kateqoriyalar
  return <DataEntryContainer assignment="all" strictMode={true} />;
};

export default SchoolAdminDataEntry;
