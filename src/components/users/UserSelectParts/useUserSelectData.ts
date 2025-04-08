
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

export const useUserSelectData = (
  selectedId: string,
  isOpen: boolean,
  searchTerm: string
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);

  // İstifadəçiləri yükləmə
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return; // Popover açıq deyilsə, istifadəçiləri yükləməyə ehtiyac yoxdur
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('İstifadəçilər sorğulanır...');
        let query = supabase.from('profiles').select('id, full_name, email');
        
        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.limit(20);
        
        if (error) {
          console.error('İstifadəçiləri yükləyərkən xəta:', error);
          throw new Error(error.message || 'İstifadəçiləri yükləyərkən xəta baş verdi');
        }
        
        // Təhlükəsizlik üçün data-nın array olduğunu yoxla
        const safeData = Array.isArray(data) ? data : [];
        console.log(`${safeData.length} istifadəçi yükləndi`);
        setUsers(safeData as User[]);
      } catch (err) {
        console.error('İstifadəçiləri yükləyərkən istisna:', err);
        setError(err instanceof Error ? err.message : 'İstifadəçilər yüklənərkən xəta baş verdi');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, searchTerm]);

  // Seçilmiş istifadəçini yüklə (əgər varsa və users massivində yoxdursa)
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (!selectedId || selectedUserData) return;
      
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
  const fetchUsers = async () => {
    // Bu funksiya manual yeniləmə üçün istifadə oluna bilər
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(20);
      
      if (error) throw new Error(error.message);
      
      const safeData = Array.isArray(data) ? data : [];
      setUsers(safeData as User[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    selectedUserData,
    fetchUsers
  };
};
