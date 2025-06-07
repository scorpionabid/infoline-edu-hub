
import React from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorDataEntry } from './SectorDataEntry';
import { SchoolDataEntryManager } from './SchoolDataEntryManager';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Card, CardContent } from '@/components/ui/card';

interface DataEntryContainerProps {
  assignment?: 'all' | 'schools' | 'sectors';
}

export const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ 
  assignment = 'all' 
}) => {
  const user = useAuthStore(selectUser);
  const { userRole } = usePermissions();

  console.log('DataEntryContainer - User role:', userRole, 'Assignment:', assignment);

  // ✅ DƏYIŞDİ: Assignment əsasında komponent seçimi
  if (assignment === 'schools' || userRole === 'schooladmin') {
    // Məktəb məlumatları üçün
    if (userRole === 'sectoradmin') {
      // Sektor admin məktəb seçir
      return <SectorDataEntry />;
    } else if (userRole === 'schooladmin') {
      // Məktəb admin birbaşa məlumat daxil edir
      return (
        <SchoolDataEntryManager 
          schoolId={user?.school_id || ''} 
          onClose={() => {}}
          onComplete={() => {}}
        />
      );
    }
  }

  // Default case
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground">
          Bu bölmə sizin icazəniz üçün uyğun deyil
        </p>
      </CardContent>
    </Card>
  );
};
