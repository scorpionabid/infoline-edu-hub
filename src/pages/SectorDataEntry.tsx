
import React from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorOnlyDataEntry } from '@/components/dataEntry/SectorOnlyDataEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

/**
 * Sektor Məlumat Daxil Etmə Səhifəsi
 * Yalnız sektor adminləri üçün - sektor məlumatlarını daxil etmək üçün
 */
const SectorDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);

  // Access control - yalnız sektor adminləri üçün
  if (user?.role !== 'sectoradmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sektor Məlumatları Daxil Etmə
          </CardTitle>
          <p className="text-muted-foreground">
            Sektorunuza aid məlumatları daxil edin və idarə edin
          </p>
        </CardHeader>
      </Card>

      {/* Sektor Data Entry Component */}
      <SectorOnlyDataEntry />
    </div>
  );
};

export default SectorDataEntry;
