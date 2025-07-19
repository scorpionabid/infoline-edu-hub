import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus } from "lucide-react";
import type { UserRole } from "@/types/auth";

interface Permission {
  key: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  [key: string]: {
    [permission: string]: boolean | 'inherited' | 'conditional';
  };
}

export const PermissionMatrix = () => {
  const { t } = useTranslation();

  const roles: { value: UserRole; label: string; color: string }[] = [
    { value: 'superadmin', label: 'SuperAdmin', color: 'destructive' },
    { value: 'regionadmin', label: 'Region Admin', color: 'default' },
    { value: 'sectoradmin', label: 'Sektor Admin', color: 'secondary' },
    { value: 'schooladmin', label: 'Məktəb Admin', color: 'outline' },
    { value: 'teacher', label: 'Müəllim', color: 'outline' },
    { value: 'user', label: 'İstifadəçi', color: 'outline' }
  ];

  const permissions: Permission[] = [
    // Data Management
    { key: 'canViewData', name: 'Məlumatları görə bilər', description: 'Sistemdəki məlumatları görüntüləyə bilər', category: 'Data Management' },
    { key: 'canEditData', name: 'Məlumatları redaktə edə bilər', description: 'Məlumatları dəyişə bilər', category: 'Data Management' },
    { key: 'canDeleteData', name: 'Məlumatları silə bilər', description: 'Məlumatları sistemdən silə bilər', category: 'Data Management' },
    { key: 'canApproveData', name: 'Məlumatları təsdiq edə bilər', description: 'Məlumatları təsdiq və ya rədd edə bilər', category: 'Data Management' },
    
    // User Management
    { key: 'canManageUsers', name: 'İstifadəçiləri idarə edə bilər', description: 'İstifadəçi hesablarını yarada və idarə edə bilər', category: 'User Management' },
    { key: 'canAssignRoles', name: 'Rol təyin edə bilər', description: 'İstifadəçilərə rol təyin edə bilər', category: 'User Management' },
    { key: 'canViewAllUsers', name: 'Bütün istifadəçiləri görə bilər', description: 'Sistemdəki bütün istifadəçiləri görə bilər', category: 'User Management' },
    
    // School Management
    { key: 'canManageSchools', name: 'Məktəbləri idarə edə bilər', description: 'Məktəb məlumatlarını yarada və dəyişə bilər', category: 'School Management' },
    { key: 'canManageSectors', name: 'Sektorları idarə edə bilər', description: 'Sektor məlumatlarını yarada və dəyişə bilər', category: 'School Management' },
    { key: 'canManageRegions', name: 'Regionları idarə edə bilər', description: 'Region məlumatlarını yarada və dəyişə bilər', category: 'School Management' },
    
    // System Management
    { key: 'canManageCategories', name: 'Kateqoriyaları idarə edə bilər', description: 'Məlumat kateqoriyalarını yarada və dəyişə bilər', category: 'System Management' },
    { key: 'canManageColumns', name: 'Sütunları idarə edə bilər', description: 'Məlumat sütunlarını yarada və dəyişə bilər', category: 'System Management' },
    { key: 'canViewReports', name: 'Hesabatları görə bilər', description: 'Sistem hesabatlarını görüntüləyə bilər', category: 'System Management' },
    { key: 'canManageSystem', name: 'Sistemi idarə edə bilər', description: 'Sistem tənzimləmələrini dəyişə bilər', category: 'System Management' }
  ];

  const rolePermissions: RolePermissions = {
    superadmin: {
      canViewData: true,
      canEditData: true,
      canDeleteData: true,
      canApproveData: true,
      canManageUsers: true,
      canAssignRoles: true,
      canViewAllUsers: true,
      canManageSchools: true,
      canManageSectors: true,
      canManageRegions: true,
      canManageCategories: true,
      canManageColumns: true,
      canViewReports: true,
      canManageSystem: true
    },
    regionadmin: {
      canViewData: true,
      canEditData: true,
      canDeleteData: 'conditional',
      canApproveData: true,
      canManageUsers: 'conditional',
      canAssignRoles: 'conditional',
      canViewAllUsers: 'conditional',
      canManageSchools: 'conditional',
      canManageSectors: 'conditional',
      canManageRegions: 'conditional',
      canManageCategories: true,
      canManageColumns: true,
      canViewReports: true,
      canManageSystem: false
    },
    sectoradmin: {
      canViewData: true,
      canEditData: true,
      canDeleteData: 'conditional',
      canApproveData: true,
      canManageUsers: 'conditional',
      canAssignRoles: 'conditional',
      canViewAllUsers: 'conditional',
      canManageSchools: 'conditional',
      canManageSectors: false,
      canManageRegions: false,
      canManageCategories: false,
      canManageColumns: 'conditional',
      canViewReports: true,
      canManageSystem: false
    },
    schooladmin: {
      canViewData: 'conditional',
      canEditData: 'conditional',
      canDeleteData: false,
      canApproveData: false,
      canManageUsers: false,
      canAssignRoles: false,
      canViewAllUsers: false,
      canManageSchools: 'conditional',
      canManageSectors: false,
      canManageRegions: false,
      canManageCategories: false,
      canManageColumns: false,
      canViewReports: 'conditional',
      canManageSystem: false
    },
    teacher: {
      canViewData: 'conditional',
      canEditData: 'conditional',
      canDeleteData: false,
      canApproveData: false,
      canManageUsers: false,
      canAssignRoles: false,
      canViewAllUsers: false,
      canManageSchools: false,
      canManageSectors: false,
      canManageRegions: false,
      canManageCategories: false,
      canManageColumns: false,
      canViewReports: false,
      canManageSystem: false
    },
    user: {
      canViewData: 'conditional',
      canEditData: false,
      canDeleteData: false,
      canApproveData: false,
      canManageUsers: false,
      canAssignRoles: false,
      canViewAllUsers: false,
      canManageSchools: false,
      canManageSectors: false,
      canManageRegions: false,
      canManageCategories: false,
      canManageColumns: false,
      canViewReports: false,
      canManageSystem: false
    }
  };

  const getPermissionIcon = (permission: boolean | 'inherited' | 'conditional') => {
    switch (permission) {
      case true:
        return <Check className="h-4 w-4 text-green-600" />;
      case false:
        return <X className="h-4 w-4 text-red-600" />;
      case 'conditional':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPermissionText = (permission: boolean | 'inherited' | 'conditional') => {
    switch (permission) {
      case true:
        return t('allowed') || 'İcazə verilir';
      case false:
        return t('denied') || 'İcazə verilmir';
      case 'conditional':
        return t('conditional') || 'Şərti';
      default:
        return t('undefined') || 'Müəyyən edilməyib';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">{t('permission') || 'Səlahiyyət'}</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.value} className="text-center min-w-[120px]">
                        <Badge variant={role.color as any} className="whitespace-nowrap">
                          {role.label}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPermissions.map((permission) => (
                    <TableRow key={permission.key}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.value} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getPermissionIcon(rolePermissions[role.value]?.[permission.key])}
                            <span className="text-xs text-muted-foreground">
                              {getPermissionText(rolePermissions[role.value]?.[permission.key])}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('legend') || 'Açıqlama'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <strong>{t('allowed') || 'İcazə verilir'}:</strong> {t('allowedDesc') || 'Bu əməliyyat həmişə icazə verilir'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-sm">
                <strong>{t('denied') || 'İcazə verilmir'}:</strong> {t('deniedDesc') || 'Bu əməliyyat heç vaxt icazə verilmir'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                <strong>{t('conditional') || 'Şərti'}:</strong> {t('conditionalDesc') || 'Müəyyən şərtlər daxilində icazə verilir'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};