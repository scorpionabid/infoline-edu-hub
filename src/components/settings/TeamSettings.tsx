import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePermissions } from "@/hooks/auth/usePermissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Shield, History, Settings } from "lucide-react";
import { RoleManagementTable } from "./role-management/RoleManagementTable";
import { PermissionMatrix } from "./role-management/PermissionMatrix";
import { RoleAuditLog } from "./role-management/RoleAuditLog";
import { BulkRoleOperations } from "./role-management/BulkRoleOperations";

const TeamSettings = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, userRole } = usePermissions();
  const [activeTab, setActiveTab] = useState("users");

  // Access control - only superadmins can access this feature
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("teamSettings") || "Komanda Tənzimləmələri"}
            </CardTitle>
            <CardDescription>
              {t("roleManagement") || "Rol və səlahiyyət idarəetməsi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {t("accessDenied") || "Bu səhifəyə yalnız SuperAdmin-lər daxil ola bilər."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("roleManagement") || "Rol İdarəetməsi"}
            <Badge variant="secondary" className="ml-2">
              SuperAdmin
            </Badge>
          </CardTitle>
          <CardDescription>
            {t("roleManagementDescription") || "İstifadəçi rolları və səlahiyyətlərini idarə edin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("userRoles") || "İstifadəçi Rolları"}
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("permissions") || "Səlahiyyətlər"}
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("bulkOperations") || "Toplu Əməliyyatlar"}
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("auditLog") || "Audit Jurnal"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("userRoleManagement") || "İstifadəçi Rol İdarəetməsi"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("userRoleManagementDesc") || "İstifadəçilərə rol təyin edin və mövcud rolları idarə edin"}
                  </p>
                </div>
                <RoleManagementTable />
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("permissionMatrix") || "Səlahiyyət Matrisi"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("permissionMatrixDesc") || "Hər rol üçün tətbiq olunan səlahiyyətləri görün"}
                  </p>
                </div>
                <PermissionMatrix />
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("bulkRoleOperations") || "Toplu Rol Əməliyyatları"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("bulkRoleOperationsDesc") || "Çoxlu istifadəçiyə eyni anda rol təyin edin və ya rolları idxal/ixrac edin"}
                  </p>
                </div>
                <BulkRoleOperations />
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("roleChangeHistory") || "Rol Dəyişikliyi Tarixçəsi"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("roleChangeHistoryDesc") || "Rol dəyişikliklərinin tarixçəsini və audit jurnalını görün"}
                  </p>
                </div>
                <RoleAuditLog />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;