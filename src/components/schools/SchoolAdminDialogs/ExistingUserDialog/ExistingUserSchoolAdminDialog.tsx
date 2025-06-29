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
import { AlertCircle, Loader2, Search } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import { assignExistingUserAsSchoolAdmin } from "@/services/schoolAdminService";
import { useAssignableUsers } from "@/hooks/user/useAssignableUsers";
import { useUserRegion } from "@/hooks/auth/useUserRegion";
import { FullUserData } from "@/types/user";
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
  
  // Current user region info
  const { regionId, isLoading: regionLoading } = useUserRegion();
  
  // İstifadəçiləri yüklə - region-aware filtering ilə
  const { users, isLoading: usersLoading, error: usersError } = useAssignableUsers(regionId || undefined);
  
  // Log users for debugging
  useEffect(() => {
    if (isOpen && users) {
      console.log('🏫 SchoolAdmin - Assignable users loaded:', {
        regionId,
        totalUsers: users.length,
        schoolId,
        schoolName,
        users: users.map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role,
          region_id: u.region_id,
          sector_id: u.sector_id,
          school_id: u.school_id
        }))
      });
    }
  }, [isOpen, users, regionId, schoolId, schoolName]);

  // Dialog açıldıqda state-i sıfırla
  useEffect(() => {
    if (isOpen) {
      setUserId("");
      setSearchTerm("");
      setError("");
    }
    
    if (usersError) {
      setError(
        t("errorFetchingUsers") ||
          "İstifadəçiləri əldə edərkən xəta baş verdi"
      );
      toast.error(
        t("errorFetchingUsers") ||
          "İstifadəçiləri əldə edərkən xəta baş verdi"
      );
    }
  }, [isOpen, t, usersError]);

  // useCallback ilə təyin etmə əməliyyatı
  const handleSubmit = useCallback(async () => {
    if (!userId || userId === "no-users-found") {
      setError(t("selectUser") || "Zəhmət olmasa istifadəçi seçin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await assignExistingUserAsSchoolAdmin(userId, schoolId);

      if (result.success) {
        toast.success(
          t("adminAssignedSuccessfully") || "Admin uğurla təyin edildi"
        );
        onSuccess();
        onClose();
      } else {
        setError(
          result.error ||
            t("errorAssigningAdmin") ||
            "Admin təyin edilərkən xəta baş verdi"
        );
        toast.error(
          result.error ||
            t("errorAssigningAdmin") ||
            "Admin təyin edilərkən xəta baş verdi"
        );
      }
    } catch (e: any) {
      setError(e.message || t("unknownError") || "Bilinməyən xəta");
      toast.error(e.message || t("unknownError") || "Bilinməyən xəta");
    } finally {
      setLoading(false);
    }
  }, [userId, schoolId, t, onSuccess, onClose]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }
    
    let filtered = users;
    
    // Apply search filter if search term exists
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const matchesName = user.full_name?.toLowerCase().includes(term) || false;
        const matchesEmail = user.email?.toLowerCase().includes(term) || false;
        return matchesName || matchesEmail;
      });
    }
    
    console.log('🎯 SchoolAdmin - Final filtered users:', {
      original: users.length,
      afterSearch: filtered.length,
      searchTerm,
      regionId,
      schoolName
    });
    
    return filtered;
  }, [users, searchTerm, regionId, schoolName]);

  // Dialoq yalnız açıq olduqda render edilir
  if (!isOpen) {
    return null;
  }
  
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

        {/* Axtarış sahəsi */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_users") || "İstifadəçiləri axtar..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="grid gap-4 py-4">
          {(usersLoading || regionLoading) ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">{t("loading") || "Yüklənir..."}</span>
            </div>
          ) : filteredUsers.length > 0 ? (
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
                          {user.email} {user.role ? `• ${user.role}` : '• Təyin edilməyib'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchTerm 
                  ? t("noUsersFoundForSearch") || "Axtarışınıza uyğun istifadəçi tapılmadı" 
                  : t("noUsersFound") || "Təyin edilə bilən istifadəçi tapılmadı"}
              </AlertDescription>
            </Alert>
          )}

          {/* Debugging info for development */}
          {!usersLoading && !regionLoading && users && users.length > 0 && (
            <div className="p-3 rounded-md bg-blue-50 text-blue-800 text-xs">
              <p className="font-medium">Debug məlumatı:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Region ID: {regionId || 'Yoxdur'}</li>
                <li>Məktəb: {schoolName}</li>
                <li>Cəmi istifadəçi sayı: {users.length}</li>
                <li>Filtrdən sonra qalan: {filteredUsers.length}</li>
                <li>Axtarış termi: {searchTerm || 'Yoxdur'}</li>
              </ul>
              <p className="mt-2 text-xs opacity-75">
                Bu məlumat yalnız development zamanı görünür.
              </p>
            </div>
          )}
        </div>

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
            disabled={loading || !userId || userId === "no-users-found"}
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