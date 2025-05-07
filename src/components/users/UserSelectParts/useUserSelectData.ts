
import { useState, useEffect } from 'react';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';

// Minimal User interface
export interface SimpleUser {
  id: string;
  full_name?: string;
  email?: string;
}

// Hook'un qaytaracağı nəticə tipi
export interface UserSelectDataResult {
  users: SimpleUser[];
  loading: boolean;
  error: string | null;
  selectedUser: SimpleUser | null;
  fetchUsers: () => void;
}

/**
 * İstifadəçi seçimi üçün data management hook'u
 */
export function useUserSelectData(selectedId?: string): UserSelectDataResult {
  const [selectedUser, setSelectedUser] = useState<SimpleUser | null>(null);
  
  // useAvailableUsers hook'unu istifadə edirik
  const { 
    users: availableUsers, 
    loading, 
    error,
    fetchAvailableUsers
  } = useAvailableUsers();

  // useAvailableUsers hook'undan gələn istifadəçiləri emal edirik
  useEffect(() => {
    if (availableUsers && Array.isArray(availableUsers)) {
      // Yalnız valid istifadəçiləri filtrləyirik
      const validUsers = availableUsers
        .filter(user => user && typeof user === 'object' && user.id)
        .map(user => ({
          id: user.id,
          full_name: user.full_name || 'İsimsiz İstifadəçi',
          email: user.email || ''
        }));
      
      // Seçilmiş istifadəçini tap
      if (selectedId) {
        const found = validUsers.find(user => user.id === selectedId);
        if (found) {
          setSelectedUser(found);
        } else {
          // Əgər istifadəçi tapılmayıbsa, minimal bir istifadəçi obyekti yarat
          setSelectedUser({ id: selectedId });
        }
      }
    }
  }, [availableUsers, selectedId]);

  // İlk yüklənmədə istifadəçiləri yüklə
  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  // Təhlükəsiz istifadəçi massivi hazırla
  const safeUsers = availableUsers && Array.isArray(availableUsers)
    ? availableUsers
        .filter(user => user && typeof user === 'object' && user.id)
        .map(user => ({
          id: user.id,
          full_name: user.full_name || 'İsimsiz İstifadəçi',
          email: user.email || ''
        }))
    : [];

  return {
    users: safeUsers,
    loading,
    error: error ? error.message : null,
    selectedUser,
    fetchUsers: fetchAvailableUsers
  };
}
