import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { Loader2, CheckCircle, Clock, XCircle, Grid3X3, List, Settings } from "lucide-react";
import { EnhancedApprovalManager } from "@/components/approval/ApprovalManager";
import { ColumnBasedApprovalManager } from "@/components/approval/column-based";

// Static filter object to prevent re-creation
const INITIAL_FILTER = { status: 'pending' as const };

type ApprovalMode = 'traditional' | 'column-based';

const ApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasRole } = usePermissions();
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('traditional');

  // Check if user can access column-based approval
  const canUseColumnBased = hasRole(['sectoradmin', 'regionadmin', 'superadmin']);

  return (
    <div className="container mx-auto py-4 px-2">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("approval.page_title")}</h1>
            <p className="text-muted-foreground mt-1">
              Məktəb məlumatlarını təsdiq və ya rədd edin
            </p>
          </div>
          
          {/* Mode Switcher */}
          {canUseColumnBased && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Görünüş:</span>
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={approvalMode === 'traditional' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setApprovalMode('traditional')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Ənənəvi
                </Button>
                <Button
                  variant={approvalMode === 'column-based' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setApprovalMode('column-based')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Sütun-əsaslı
                  <Badge variant="secondary" className="text-xs">
                    YENİ
                  </Badge>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mode Description */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {approvalMode === 'traditional' ? (
                <>
                  <List className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Ənənəvi Təsdiq Rejimi</div>
                    <div className="text-sm text-blue-700">
                      Bütün kateqoriyalar üzrə məktəb məlumatlarını kart formatında görün və təsdiq edin
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Grid3X3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Sütun-əsaslı Təsdiq Rejimi</div>
                    <div className="text-sm text-blue-700">
                      Sütun seçib həmin sütuna aid bütün məktəblərin məlumatlarını təsdiq edin (Sektoradmin üçün optimallaşdırılıb)
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Interface */}
        {approvalMode === 'traditional' ? (
          <EnhancedApprovalManager
            initialFilter={INITIAL_FILTER}
            className="space-y-6"
          />
        ) : (
          <ColumnBasedApprovalManager
            autoLoadCategories={true}
            autoLoadColumns={true}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;