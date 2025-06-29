
import React, { useState, useCallback, useEffect } from "react";
import UserListTable from "@/components/users/UserListTable";
import UserHeader from "@/components/users/UserHeader";
import AddUserDialog from "@/components/users/AddUserDialog";
import { Loader2 } from "lucide-react";
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

  // All hooks must be called before any early returns
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
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

  console.log('Users.tsx - Current filters:', filters);
  console.log('Users.tsx - List filters:', listFilters);

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
      console.log('🚀 Users.tsx handleFilterChange called with:', newFilters);
      setFilters((prev) => {
        const updatedFilters = {
          ...prev,
          ...newFilters,
        };
        console.log('🚀 Users.tsx Updated filters:', updatedFilters);
        return updatedFilters;
      });
      setCurrentPage(1);
    },
    [],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Early return after all hooks
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
            setIsAddUserDialogOpen(true);
          }}
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-md">
            <UserListTable
              users={users}
              currentUserRole={user?.role || 'schooladmin'}
              onEdit={(user: FullUserData) => {
                console.log("Edit user:", user);
              }}
              onDelete={(user: FullUserData) => {
                console.log("Delete user:", user);
              }}
              onViewDetails={(user: FullUserData) => {
                console.log("View user details:", user);
              }}
            />
            {totalPages > 1 && (
              <div className="flex justify-center py-4">
                {/* Burada səhifələmə komponentini əlavə edə bilərsiniz */}
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-md ${currentPage === i + 1
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Add User Dialog */}
        <AddUserDialog
          isOpen={isAddUserDialogOpen}
          onClose={() => setIsAddUserDialogOpen(false)}
          onSuccess={handleUserAddedOrEdited}
        />
      </div>
    </>
  );
};

export default Users;
