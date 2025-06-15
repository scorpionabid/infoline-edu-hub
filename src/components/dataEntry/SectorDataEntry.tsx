
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorAdminSchoolList } from '@/components/schools/SectorAdminSchoolList'; // Fixed import
import { Building2 } from 'lucide-react';

interface SectorDataEntryProps {
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
  onBulkAction?: (action: string, schoolIds: string[]) => void;
}

export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  onDataEntry,
  onSendNotification,
  onBulkAction
}) => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);

  const handleDataEntry = (schoolId: string) => {
    console.log('SectorDataEntry: Data entry requested for school:', schoolId);
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  };

  const handleSchoolSelect = (schoolId: string) => {
    console.log('SectorDataEntry: School selected:', schoolId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="flex-shrink-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sektor Məlumat İdarəetməsi
            {user?.role === 'sectoradmin' && (
              <Badge className="bg-blue-100 text-blue-800">
                Sektor Administratoru
              </Badge>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            Sektorunuza aid məktəblərin məlumatlarını idarə edin
          </p>
        </CardHeader>
      </Card>

      {/* School List with Data Entry */}
      <div className="flex-1 overflow-hidden">
        <SectorAdminSchoolList
          onSchoolSelect={handleSchoolSelect}
          onDataEntry={handleDataEntry}
        />
      </div>
    </div>
  );
};

export default SectorDataEntry;
