
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserSelectDataResult } from './types';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';

export const useUserSelectData = (
  selectedId: string,
  isOpen: boolean,
  searchTerm: string
): UserSelectDataResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  
  // Admin olmayan istifadəçiləri əldə etmək üçün hook
  const { 
    users: availableUsers, 
    loading: availableUsersLoading, 
    error: availableUsersError,
    fetchAvailableUsers
  } = useAvailableUsers();

  // İstifadəçiləri yükləmə
  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return; // Popover açıq deyilsə, istifadəçiləri yükləməyə ehtiyac yoxdur
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('İstifadəçilər yüklənir...');
        
        // Admin olmayan istifadəçiləri əldə etmək üçün useAvailableUsers hook-unu istifadə edirik
        if (availableUsersError) {
          throw new Error(availableUsersError.message);
        }
        
        // AvailableUsers boşdursa və yüklənməyibsə, yenidən yükləyək
        if (!availableUsersLoading && (!availableUsers || availableUsers.length === 0)) {
          console.log('Əlavə istifadəçilər yüklənir...');
          await fetchAvailableUsers();
        }
        
        // Əmin olaq ki, availableUsers massivdir
        const safeAvailableUsers = Array.isArray(availableUsers) ? availableUsers : [];
        
        // Axtarış termini ilə filtrlənmiş istifadəçilər
        let filteredUsers = safeAvailableUsers;
        
        if (searchTerm && searchTerm.length > 0) {
          const lowercaseSearchTerm = searchTerm.toLowerCase();
          filteredUsers = safeAvailableUsers.filter(user => 
            (user.full_name && user.full_name.toLowerCase().includes(lowercaseSearchTerm)) || 
            (user.email && user.email.toLowerCase().includes(lowercaseSearchTerm))
          );
        }
        
        // Minimal User interfacesinə çevir
        const mappedUsers: User[] = filteredUsers.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email
        }));
        
        console.log(`${mappedUsers.length} istifadəçi yükləndi`);
        setUsers(mappedUsers);
      } catch (err) {
        console.error('İstifadəçiləri yükləyərkən istisna:', err);
        setError(err instanceof Error ? err.message : 'İstifadəçilər yüklənərkən xəta baş verdi');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isOpen, searchTerm, availableUsers, availableUsersLoading, availableUsersError, fetchAvailableUsers]);

  // Seçilmiş istifadəçini yüklə (əgər varsa və users massivində yoxdursa)
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (!selectedId || selectedUserData?.id === selectedId) return;
      
      // Users massivini təhlükəsiz şəkildə istifadə et
      const safeUsers = Array.isArray(users) ? users : [];
      
      // Əgər users massivində artıq seçilmiş istifadəçi varsa
      const existingUser = safeUsers.find(user => user.id === selectedId);
      if (existingUser) {
        setSelectedUserData(existingUser);
        return;
      }
      
      // Əks təqdirdə, yüklə
      try {
        setLoading(true);
        console.log(`Seçilmiş istifadəçi yüklənir: ${selectedId}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', selectedId)
          .single();
        
        if (error) {
          console.error('Seçilmiş istifadəçini yükləyərkən xəta:', error);
          return;
        }
        
        if (!data) {
          console.log('Seçilmiş istifadəçi tapılmadı');
          return;
        }
        
        console.log('Seçilmiş istifadəçi yükləndi:', data);
        setSelectedUserData(data as User);
        
        // Users massivini də yeniləyək, əvvəlcə təhlükəsizlik yoxlaması
        setUsers(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some(user => user.id === data.id)) {
            return safePrev;
          }
          return [...safePrev, data as User];
        });
      } catch (err) {
        console.error('Seçilmiş istifadəçini yükləyərkən istisna:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedUser();
  }, [selectedId, users, selectedUserData]);

  // İstifadəçiləri yeniləmək üçün funksiya
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    await fetchAvailableUsers();
    setLoading(false);
  }, [fetchAvailableUsers]);

  // Refresh eventi dinlə
  useEffect(() => {
    const handleRefresh = () => {
      console.log('refresh-users eventi alındı, istifadəçilər yenilənir...');
      fetchUsers();
    };
    
    document.addEventListener('refresh-users', handleRefresh);
    
    return () => {
      document.removeEventListener('refresh-users', handleRefresh);
    };
  }, [fetchUsers]);

  return {
    users,
    loading: loading || availableUsersLoading,
    error: error || (availableUsersError ? availableUsersError.message : null),
    selectedUserData,
    fetchUsers
  };
};
