import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, UserCheck, UserX, Users, Trash2, X } from "lucide-react";
import { UserRole } from "@/types/user";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent } from "@/components/ui/card";

type EntityType = "region" | "sector" | "school";

interface UserHeaderProps {
  entityTypes: EntityType[];
  onUserAddedOrEdited: () => void;
  currentFilter?: {
    search?: string;
    role?: string | string[];
    status?: string | string[];
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
  };
  onFilterChange?: (filter: any) => void;
  onAddUser?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  entityTypes = [],
  onUserAddedOrEdited,
  currentFilter = {},
  onFilterChange = () => {},
  onAddUser = () => {},
}) => {
  const safeEntityTypes = Array.isArray(entityTypes) ? entityTypes : [];
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (
    key: string,
    value: string | string[] | undefined,
  ) => {
    console.log(`🔧 UserHeader: Filter change - ${key}:`, value);
    
    const newFilter = {
      ...currentFilter,
      [key]: value || undefined,
    };
    
    console.log('🔧 UserHeader: New filter object:', newFilter);
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const handleAddUser = () => {
    onAddUser();
    onUserAddedOrEdited();
  };

  const userRoles = [
    "superadmin",
    "regionadmin",
    "sectoradmin",
    "schooladmin",
  ] as const;
  const userStatuses = ["active", "inactive"] as const;

  const getArrayFromFilter = (
    value: string | string[] | undefined,
  ): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const getFirstFromFilter = (value: string | string[] | undefined): string => {
    if (!value) return "";
    if (Array.isArray(value)) return value[0] || "";
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("navigation.users")}</h1>
          <p className="text-sm text-muted-foreground">{t("users.usersDescription")}</p>
        </div>
        <Button onClick={handleAddUser} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("userManagement.add_user") || "İstifadəçi əlavə et"}
        </Button>
      </div>

      {/* Compact Tabs */}
      <Tabs 
        value={getFirstFromFilter(currentFilter.status) || "active"} 
        onValueChange={(value) => {
          const filterValue = value === "all" ? undefined : value;
          handleFilterChange("status", filterValue);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="active" className="text-xs">
            Aktiv
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs">
            Deaktiv
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            Hamısı
          </TabsTrigger>
          <TabsTrigger value="deleted" className="text-xs">
            Silinmiş
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Compact Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("users.searchUsers") || "İstifadəçiləri axtarın..."}
            value={currentFilter?.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filterlər
          </Button>
          {((currentFilter.role && currentFilter.role.length > 0) ||
            (currentFilter.status && currentFilter.status.length > 0) ||
            currentFilter.schoolId) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
            >
              Təmizlə
            </Button>
          )}
        </div>
      </div>

      {/* Compact Advanced Filters */}
      {showFilters && (
        <div className="p-3 bg-muted/30 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              value={
                Array.isArray(currentFilter?.role)
                  ? currentFilter.role[0] || ""
                  : currentFilter?.role || ""
              }
              onValueChange={(value) => {
                const filterValue = value === 'all_roles' ? undefined : value;
                handleFilterChange("role", filterValue);
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_roles">Bütün rollar</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(`roles.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={getFirstFromFilter(currentFilter.status)}
              onValueChange={(value) => {
                const filterValue = value === 'all_statuses' ? undefined : value;
                handleFilterChange("status", filterValue);
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">Bütün statuslar</SelectItem>
                {userStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`common.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {safeEntityTypes.filter((t) => t === "school" || t === "sector").length > 0 && (
              <Input
                placeholder="Məktəb ID"
                value={currentFilter.schoolId || ""}
                onChange={(e) => handleFilterChange("schoolId", e.target.value)}
                className="h-8"
              />
            )}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(getArrayFromFilter(currentFilter?.role).length > 0 || 
        getArrayFromFilter(currentFilter?.status).length > 0 || 
        currentFilter?.schoolId) && (
        <div className="flex flex-wrap gap-1">
          {getArrayFromFilter(currentFilter?.role).map((role) => (
            <Badge
              key={role}
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              {t(`roles.${role}`)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const currentRoles = getArrayFromFilter(currentFilter?.role);
                  const newRoles = currentRoles.filter((r: string) => r !== role);
                  handleFilterChange("role", newRoles.length ? newRoles : undefined);
                }}
              />
            </Badge>
          ))}

          {getArrayFromFilter(currentFilter?.status).map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              {t(`common.${status.toLowerCase()}`)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const currentStatuses = getArrayFromFilter(currentFilter?.status);
                  const newStatuses = currentStatuses.filter((s: string) => s !== status);
                  handleFilterChange("status", newStatuses.length ? newStatuses : undefined);
                }}
              />
            </Badge>
          ))}

          {currentFilter?.schoolId && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              Məktəb: {currentFilter.schoolId}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("schoolId", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHeader;
