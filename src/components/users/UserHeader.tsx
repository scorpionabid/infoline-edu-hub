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
    <div className="space-y-6">
      {/* Header Section with improved design */}
      <div className="bg-background rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{t("navigation.users")}</h1>
            <p className="text-muted-foreground text-lg">{t("users.usersDescription")}</p>
          </div>
          <Button onClick={handleAddUser} size="lg" className="w-fit shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-5 w-5 mr-2" />
            {t("userManagement.add_user") || "İstifadəçi əlavə et"}
          </Button>
        </div>
      </div>

      {/* Status Tabs - Minimalist Design */}
      <Tabs 
        value={getFirstFromFilter(currentFilter.status) || "active"} 
        onValueChange={(value) => {
          const filterValue = value === "all" ? undefined : value;
          handleFilterChange("status", filterValue);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-background border rounded-lg p-1">
          <TabsTrigger 
            value="active" 
            className="text-sm font-medium"
          >
            Aktiv İstifadəçilər
          </TabsTrigger>
          <TabsTrigger 
            value="inactive" 
            className="text-sm font-medium"
          >
            Deaktiv İstifadəçilər
          </TabsTrigger>
          <TabsTrigger 
            value="all"
            className="text-sm font-medium"
          >
            Bütün İstifadəçilər
          </TabsTrigger>
          <TabsTrigger 
            value="deleted" 
            className="text-sm font-medium"
          >
            Silinmiş İstifadəçilər
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filters Section */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder={t("users.searchUsers") || "İstifadəçiləri axtarın..."}
                value={currentFilter?.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-12 h-11 text-base border-muted-foreground/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="h-11 px-6 border-muted-foreground/20 hover:bg-primary/5"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("users.filters") || "Filterlər"}
              </Button>
              {((currentFilter.role && currentFilter.role.length > 0) ||
                (currentFilter.status && currentFilter.status.length > 0) ||
                currentFilter.schoolId) && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="h-11 px-4 text-muted-foreground hover:text-foreground"
                >
                  {t("users.clearFilters") || "Filterləri təmizlə"}
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("users.role") || "Rol"}
                  </label>
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
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t("users.selectRole") || "Rol seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_roles">{t("users.allRoles") || "Bütün rollar"}</SelectItem>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(`roles.${role}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("common.status") || "Status"}
                  </label>
                  <Select
                    value={getFirstFromFilter(currentFilter.status)}
                    onValueChange={(value) => {
                      const filterValue = value === 'all_statuses' ? undefined : value;
                      handleFilterChange("status", filterValue);
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t("users.selectStatus") || "Status seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_statuses">{t("users.allStatuses") || "Bütün statuslar"}</SelectItem>
                      {userStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`common.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {safeEntityTypes.filter((t) => t === "school" || t === "sector").length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t("users.school") || "Məktəb"}
                    </label>
                    <Input
                      placeholder={t("users.schoolId") || "Məktəb ID"}
                      value={currentFilter.schoolId || ""}
                      onChange={(e) => handleFilterChange("schoolId", e.target.value)}
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(getArrayFromFilter(currentFilter?.role).length > 0 || 
            getArrayFromFilter(currentFilter?.status).length > 0 || 
            currentFilter?.schoolId) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {getArrayFromFilter(currentFilter?.role).map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/15"
                >
                  {t("users.role")}: {t(`roles.${role}`)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-primary/70" 
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/15"
                >
                  {t("common.status")}: {t(`common.${status.toLowerCase()}`)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-primary/70" 
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/15"
                >
                  {t("users.school")}: {currentFilter.schoolId}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                    onClick={() => handleFilterChange("schoolId", undefined)}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHeader;
