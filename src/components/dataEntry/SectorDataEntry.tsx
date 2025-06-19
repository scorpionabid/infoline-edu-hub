import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { Building2, Info } from "lucide-react";

interface SectorDataEntryProps {
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
  onBulkAction?: (action: string, schoolIds: string[]) => void;
  categoryId?: string;
  bulkMode?: boolean;
}

/**
 * Legacy SectorDataEntry Component
 * 
 * Bu komponent artıq workflow sistemi tərəfindən əvəz edilib.
 * Köhnə səhifələrdə compatibility üçün saxlanılır.
 */
export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  onDataEntry,
  onSendNotification,
  onBulkAction,
  categoryId,
  bulkMode = false,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  return (
    <div className="h-full flex flex-col">
      {/* Legacy Notice */}
      <Card className="flex-shrink-0 mb-6 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Info className="h-5 w-5" />
            Legacy Komponent
          </CardTitle>
          <p className="text-amber-700 text-sm">
            Bu komponent köhnədir və artıq yeni workflow sistemi tərəfindən əvəz edilib.
            Zəhmət olmasa yeni SectorDataEntry səhifəsini istifadə edin.
          </p>
        </CardHeader>
      </Card>

      {/* Original Header for Reference */}
      <Card className="flex-shrink-0 mb-6 opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sektor Məlumat İdarəetməsi (Legacy)
            {user?.role === "sectoradmin" && (
              <Badge className="bg-blue-100 text-blue-800">
                Sektor Administratoru
              </Badge>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            Bu interfeys artıq istifadə edilmir.
          </p>
        </CardHeader>
      </Card>

      {/* Disabled Content */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <div className="text-6xl text-muted-foreground">🔄</div>
            <div className="text-lg font-medium text-muted-foreground">
              Yeni Workflow Sistemi
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Bu səhifə artıq yeni workflow sistemi ilə əvəz edilib.
              Daha yaxşı istifadəçi təcrübəsi üçün yeni interfeysi istifadə edin.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline">Progressive Disclosure</Badge>
              <Badge variant="outline">Intent-First Design</Badge>
              <Badge variant="outline">Mode-Aware UI</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SectorDataEntry;