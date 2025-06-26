
import React, { useState, useCallback, useEffect } from "react";
import UserList from "@/components/users/UserList";
import UserHeader from "@/components/users/UserHeader";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { Helmet } from "react-helmet";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useUserList } from "@/hooks/user/useUserList";
import {
  User,
  UserRole,
  UserFilter as UserFilterType,
  UserStatus,
  FullUserData // Use consistent user types
} from "@/types/user";
import { toast } from "sonner";

const Users = () => {
  const { t } = useTranslation();
  const { isRegionAdmin, isSuperAdmin, isSectorAdmin, sectorId, regionId } =
    usePermissions();
  const isAuthorized = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthorized) {
      navigate("/dashboard");
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) {
    return null;
  }

  const entityTypes: Array<"region" | "sector" | "school"> = isSuperAdmin
    ? ["region", "sector", "school"]
    : isRegionAdmin
      ? ["sector", "school"]
      : ["school"];

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "" as string,
    regionId: isRegionAdmin && regionId ? regionId : "",
    sectorId: isSectorAdmin && sectorId ? sectorId : "",
    schoolId: "",
  });

  const listFilters: UserFilterType = {
    ...filters,
    role: filters.role ? [filters.role as UserRole] : [],
    status: filters.status ? [filters.status as UserStatus] : [],
  };

  const {
    users = [],
    loading,
    error,
    totalCount,
    refreshUsers,
  } = useUserList(listFilters);

  const handleUserAddedOrEdited = useCallback(() => {
    refreshUsers();
    setRefreshTrigger((prev) => prev + 1);
  }, [refreshUsers]);

  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  useEffect(() => {
    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Xəta baş verdi: İstifadəçilər yüklənərkən xəta baş verdi");
    }
  }, [error]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
      setCurrentPage(1);
    },
    [],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>{t("navigation.users")} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <UserHeader
          entityTypes={entityTypes}
          currentFilter={filters}
          onFilterChange={handleFilterChange}
          onUserAddedOrEdited={handleUserAddedOrEdited}
          onAddUser={() => {
            console.log("Add user clicked");
          }}
        />

        <UserList
          users={users}
          isLoading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEditUser={(user: FullUserData) => {
            console.log("Edit user:", user);
          }}
          onDeleteUser={(user: FullUserData) => {
            console.log("Delete user:", user);
          }}
          onSearch={(query: string) => {
            handleFilterChange({ search: query });
          }}
        />
      </div>
    </>
  );
};

export default Users;
