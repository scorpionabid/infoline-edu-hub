import React, { useState, useCallback, useEffect } from "react";
import UserListTable from "@/components/users/UserListTable";
import UserHeader from "@/components/users/UserHeader";
import AddUserDialog from "@/components/users/AddUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import UserDetailsDialog from "@/components/users/UserDetailsDialog";
import Pagination from "@/components/common/Pagination";
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
import { supabase } from "@/integrations/supabase/client";

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
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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
    totalPages: hookTotalPages,
    currentPage: hookCurrentPage,
    pageSize: hookPageSize,
    refreshUsers,
    onPageChange,
    onSort
  } = useUserList(listFilters, {
    page: currentPage,
    pageSize: pageSize,
    sortField,
    sortDirection
  });

  const handleUserAddedOrEdited = useCallback(() => {
    refreshUsers();
    setRefreshTrigger((prev) => prev + 1);
  }, [refreshUsers]);

  const totalPages = hookTotalPages || Math.ceil((totalCount || 0) / pageSize);

  // Debug log
  console.log('📊 Pagination Debug:', {
    totalCount,
    pageSize,
    totalPages,
    hookTotalPages,
    currentPage,
    hookCurrentPage,
    usersLength: users.length
  });

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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onPageChange]);

  const handleSort = useCallback((field: string) => {
    if (onSort) {
      onSort(field);
    } else {
      // Fallback logic
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    }
  }, [onSort, sortField, sortDirection]);

  const handleEditUser = useCallback((user: FullUserData) => {
    console.log("Edit user:", user);
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: FullUserData) => {
    console.log("Delete user:", user);
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  }, []);

  const handleViewUserDetails = useCallback((user: FullUserData) => {
    console.log("View user details:", user);
    setSelectedUser(user);
    setIsUserDetailsDialogOpen(true);
  }, []);

  const handleSaveUser = useCallback(async (userData: Partial<FullUserData>) => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success("İstifadəçi məlumatları yeniləndi");
      handleUserAddedOrEdited();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("İstifadəçi yenilənərkən xəta baş verdi");
      throw error;
    }
  }, [selectedUser, handleUserAddedOrEdited]);

  const handleConfirmDelete = useCallback(async (deleteType: 'soft' | 'hard') => {
    if (!selectedUser) return;

    try {
      if (deleteType === 'hard') {
        // Hard delete - actually delete the record
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);

        if (error) throw error;
        toast.success("İstifadəçi tamamilə silindi");
      } else {
        // Soft delete - just mark as inactive
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'inactive' })
          .eq('id', selectedUser.id);

        if (error) throw error;
        toast.success("İstifadəçi deaktiv edildi");
      }

      handleUserAddedOrEdited();
      setIsDeleteUserDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("İstifadəçi silinərkən xəta baş verdi");
    }
  }, [selectedUser, handleUserAddedOrEdited]);



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
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onViewDetails={handleViewUserDetails}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
            {totalPages > 1 && (
              <div className="mt-4 p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  totalItems={totalCount || 0}
                  itemsPerPage={pageSize}
                />
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
        
        {/* Edit User Dialog */}
        <EditUserDialog
          user={selectedUser}
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          onSave={handleSaveUser}
        />
        
        {/* Delete User Dialog */}
        <DeleteUserDialog
          user={selectedUser}
          isOpen={isDeleteUserDialogOpen}
          onClose={() => setIsDeleteUserDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
        
        {/* User Details Dialog */}
        <UserDetailsDialog
          user={selectedUser}
          open={isUserDetailsDialogOpen}
          onOpenChange={setIsUserDetailsDialogOpen}
        />
      </div>
    </>
  );
};

export default Users;