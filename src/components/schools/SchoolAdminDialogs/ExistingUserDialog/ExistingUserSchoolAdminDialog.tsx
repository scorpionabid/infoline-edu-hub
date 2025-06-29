
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Search, RefreshCw } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import { assignExistingUserAsSchoolAdmin } from "@/services/schoolAdminService";
import { useAssignableUsers } from "@/hooks/user/useAssignableUsers";
import { useUserRegion } from "@/hooks/auth/useUserRegion";
import { usePermissions } from "@/hooks/auth/usePermissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExistingUserSchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  onSuccess: () => void;
}

const ExistingUserSchoolAdminDialog = ({
  isOpen,
  onClose,
  schoolId,
  schoolName,
  onSuccess,
}: ExistingUserSchoolAdminDialogProps) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get user permissions and region info
  const { isSuperAdmin } = usePermissions();
  const { regionId, isLoading: regionLoading, error: regionError } = useUserRegion();
  
  // Use assignable users hook - for SuperAdmin pass undefined to get all users
  const targetRegionId = isSuperAdmin ? undefined : regionId || undefined;
  const { users, isLoading: usersLoading, error: usersError, refetch } = useAssignableUsers(targetRegionId);
  
  // Debug logging when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('🏫 SchoolAdminDialog - Dialog opened:', {
        schoolId,
        schoolName,
        regionId,
        targetRegionId,
        isSuperAdmin,
        regionLoading,
        regionError
      });
    }
  }, [isOpen, schoolId, schoolName, regionId, targetRegionId, isSuperAdmin, regionLoading, regionError]);

  // Log users when they are loaded
  useEffect(() => {
    if (isOpen && users) {
      console.log('👥 SchoolAdminDialog - Users loaded:', {
        totalUsers: users.length,
        regionId,
        targetRegionId,
        isSuperAdmin,
        sampleUsers: users.slice(0, 5).map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role,
          region_id: u.region_id
        }))
      });
    }
  }, [isOpen, users, regionId, targetRegionId, isSuperAdmin]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUserId("");
      setSearchTerm("");
      setError("");
    }
  }, [isOpen]);

  // Handle errors from hooks
  useEffect(() => {
    if (regionError) {
      console.error('❌ SchoolAdminDialog - Region error:', regionError);
      setError(t("errorFetchingRegion") || "Region məlumatları alınarkən xəta baş verdi");
    } else if (usersError) {
      console.error('❌ SchoolAdminDialog - Users error:', usersError);
      setError(t("errorFetchingUsers") || "İstifadəçi məlumatları alınarkən xəta baş verdi");
    } else {
      setError("");
    }
  }, [regionError, usersError, t]);

  // Handle assignment submission
  const handleSubmit = useCallback(async () => {
    if (!userId || userId === "no-users-found") {
      const errorMsg = t("selectUser") || "Zəhmət olmasa istifadəçi seçin";
      setError(errorMsg);
      console.error('❌ SchoolAdminDialog - No user selected');
      return;
    }

    // Validate that the user exists in our list
    const selectedUser = users.find(user => user.id === userId);
    if (!selectedUser) {
      const errorMsg = t("userNotFound") || "Seçilmiş istifadəçi tapılmadı";
      setError(errorMsg);
      console.error('❌ SchoolAdminDialog - Selected user not found in list:', userId);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('🚀 SchoolAdminDialog - Starting assignment:', { 
        userId, 
        schoolId, 
        schoolName,
        selectedUser: {
          name: selectedUser.full_name,
          email: selectedUser.email,
          role: selectedUser.role
        }
      });
      
      const result = await assignExistingUserAsSchoolAdmin(userId, schoolId);

      if (result.success) {
        console.log('✅ SchoolAdminDialog - Assignment successful');
        toast.success(t("adminAssignedSuccessfully") || "Admin uğurla təyin edildi");
        onSuccess();
        onClose();
      } else {
        console.error('❌ SchoolAdminDialog - Assignment failed:', result.error);
        const errorMsg = result.error || t("errorAssigningAdmin") || "Admin təyin edilərkən xəta baş verdi";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (e: any) {
      console.error('❌ SchoolAdminDialog - Assignment exception:', e);
      const errorMsg = e.message || t("unknownError") || "Bilinməyən xəta";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userId, schoolId, schoolName, users, t, onSuccess, onClose]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    console.log('🎯 filteredUsers - Starting filter process:', {
      usersExists: !!users,
      usersLength: users?.length || 0,
      searchTerm,
      searchTermLength: searchTerm?.length || 0
    });
    
    if (!users || users.length === 0) {
      console.log('🔍 SchoolAdminDialog - No users to filter');
      return [];
    }
    
    let filtered = users;
    
    // Apply search filter if search term exists
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      console.log('🔍 filteredUsers - Applying search filter:', { term });
      
      filtered = filtered.filter((user, index) => {
        const matchesName = user.full_name?.toLowerCase().includes(term) || false;
        const matchesEmail = user.email?.toLowerCase().includes(term) || false;
        const matches = matchesName || matchesEmail;
        
        // Log first 3 users for debugging
        if (index < 3) {
          console.log(`🎯 User ${index + 1} filter check:`, {
            name: user.full_name,
            email: user.email,
            term,
            matchesName,
            matchesEmail,
            finalMatch: matches
          });
        }
        
        return matches;
      });
      
      console.log('🎯 filteredUsers - After search filtering:', {
        originalCount: users.length,
        filteredCount: filtered.length,
        searchTerm: term
      });
    }
    
    console.log('🎯 SchoolAdminDialog - Final filtered users:', {
      original: users.length,
      afterSearch: filtered.length,
      searchTerm,
      regionId: targetRegionId,
      sampleFilteredUsers: filtered.slice(0, 3).map(u => ({
        name: u.full_name,
        email: u.email
      }))
    });
    
    return filtered;
  }, [users, searchTerm, targetRegionId]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    console.log('🔄 SchoolAdminDialog - Manual refresh triggered');
    setError("");
    await refetch();
  }, [refetch]);

  // Don't render if dialog is not open
  if (!isOpen) {
    return null;
  }

  const isInitialLoading = regionLoading || usersLoading;
  const hasUsers = filteredUsers.length > 0;
  const showNoUsersMessage = !isInitialLoading && !hasUsers && !error;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (!loading) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("assign_school_admin") || "Məktəb admin təyin et"}</DialogTitle>
          <DialogDescription>
            {t("select_user_for_school") || "Zəhmət olmasa bu məktəb üçün istifadəçi seçin:"}  
            <span className="font-medium"> {schoolName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_users") || "İstifadəçiləri axtar..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              disabled={isInitialLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={handleRefresh}
              disabled={isInitialLoading}
              title={t("refresh") || "Yenilə"}
            >
              <RefreshCw className={`h-3 w-3 ${isInitialLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Loading state */}
          {isInitialLoading && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">
                {regionLoading 
                  ? (t("loading_region") || "Region məlumatları yüklənir...")
                  : (t("loading_users") || "İstifadəçilər yüklənir...")
                }
              </span>
            </div>
          )}

          {/* User selection */}
          {!isInitialLoading && hasUsers && (
            <div>
              <Label htmlFor="userId">
                {t("selectUser") || "İstifadəçi seçin"}
              </Label>
              <Select onValueChange={(val) => setUserId(val)} value={userId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectUser") || "İstifadəçi Seç"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.full_name || user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} {user.role ? `• ${user.role}` : '• Rol təyin edilməyib'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* No users message */}
          {showNoUsersMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    {searchTerm 
                      ? (t("noUsersFoundForSearch") || "Axtarışınıza uyğun istifadəçi tapılmadı") 
                      : (t("noUsersFound") || "Təyin edilə bilən istifadəçi tapılmadı")
                    }
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t("retry") || "Yenidən cəhd et"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Debug information */}
          {!isInitialLoading && (
            <div className="p-3 rounded-md bg-blue-50 text-blue-800 text-xs">
              <p className="font-medium">Debug məlumatı:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>İstifadəçi rolu: {isSuperAdmin ? 'SuperAdmin' : 'Standard'}</li>
                <li>Region ID: {regionId || 'Yoxdur'}</li>
                <li>Target Region: {targetRegionId || 'Bütün regionlar'}</li>
                <li>Cəmi istifadəçi: {users?.length || 0}</li>
                <li>Filtrdən sonra: {filteredUsers?.length || 0}</li>
                <li>Axtarış: {searchTerm || 'Yoxdur'}</li>
                <li>Sample users: {users?.slice(0, 2).map(u => u.full_name || u.email).join(', ') || 'Yoxdur'}</li>
                <li>Sample roles: {users?.slice(0, 2).map(u => u.role || 'Role yoxdur').join(', ') || 'Yoxdur'}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outline"
          >
            {t("cancel") || "Ləğv et"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !userId || userId === "no-users-found" || isInitialLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("assigning") || "Təyin edilir..."}
              </>
            ) : (
              t("assign") || "Təyin et"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingUserSchoolAdminDialog;
