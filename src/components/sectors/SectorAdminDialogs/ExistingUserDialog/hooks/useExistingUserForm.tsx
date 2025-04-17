import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers } from '@/hooks/useUsers';
import { Sector, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth/useAuth'; // useAuth düzgün kontekst

export const useExistingUserForm = (
  sector: Sector | null,
  onSuccess?: () => void,
  onClose?: (open: boolean) => void
) => {
  const { t } = useLanguage();
  const { user } = useAuth(); // isAuthenticated əvəzinə user istifadə edək
  const form = useForm();
  const [showExistingAdmins, setShowExistingAdmins] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigningUser, setAssigningUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    users: allUsers,
    loading: loadingUsers,
    error: usersError,
    fetchUsers
  } = useUsers();
  
  const filteredUsers = allUsers.filter(user => {
    if (showExistingAdmins) {
      return true;
    }
    return user.role !== 'sectoradmin';
  });
  
  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);
  
  const handleAssignAdmin = useCallback(async () => {
    if (!sector || !selectedUserId) {
      setError(t("selectUserAndSector") || "Zəhmət olmasa istifadəçi və sektoru seçin");
      return;
    }
    
    setError(null);
    setAssigningUser(true);
    
    try {
      // Simulate assigning user as admin
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t("adminAssignedSuccessfully") || "Admin uğurla təyin edildi");
      onSuccess?.();
      onClose?.(false);
    } catch (e) {
      console.error("Admin təyin edilərkən xəta baş verdi:", e);
      setError(t("errorAssigningAdmin") || "Admin təyin edilərkən xəta baş verdi");
    } finally {
      setAssigningUser(false);
    }
  }, [sector, selectedUserId, t, onSuccess, onClose]);
  
  const handleForceRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleCheckboxChange = useCallback((checked: boolean) => {
    setShowExistingAdmins(checked);
  }, []);
  
  const resetForm = useCallback(() => {
    setSelectedUserId('');
    setError(null);
    setShowExistingAdmins(false);
  }, []);
  
  // Əslində isAuthenticated-ı user varlığı ilə əvəz edirik
  if (!user) {
    // Handle not authenticated case
    console.error("User is not authenticated");
  }
  
  return {
    form,
    selectedUserId,
    error,
    usersError,
    filteredUsers,
    loadingUsers,
    assigningUser,
    showExistingAdmins,
    handleUserSelect,
    handleAssignAdmin,
    handleForceRefresh,
    handleCheckboxChange,
    resetForm
  };
};
