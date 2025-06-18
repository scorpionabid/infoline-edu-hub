import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { SectorAdminSchoolList } from "@/components/schools/SectorAdminSchoolList";
import { Building2 } from "lucide-react";

interface SectorDataEntryProps {
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
  onBulkAction?: (action: string, schoolIds: string[]) => void;
  categoryId?: string; // Kateqoriya ID-si əlavə edildi
  bulkMode?: boolean; // Bulk rejim əlavə edildi
}

export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  onDataEntry,
  onSendNotification,
  onBulkAction,
  categoryId,
  bulkMode = false, // Default dəyər false
}) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  const handleDataEntry = (schoolId: string) => {
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  };

  const handleSchoolSelect = (schoolId: string) => {
    // School selected handler
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="flex-shrink-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sektor Məlumat İdarəetməsi
            {user?.role === "sectoradmin" && (
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
          categoryId={categoryId} // Kateqoriya ID-si ötürülür
        />
      </div>
    </div>
  );
};

export default SectorDataEntry;
