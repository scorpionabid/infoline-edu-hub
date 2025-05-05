
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface SuperUser {
  id: string;
  email: string;
  full_name?: string;
}

export const useSuperUsers = () => {
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`id, email, full_name`)
        .eq('role', 'superadmin');

      if (error) throw error;

      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('İstifadəçiləri yükləmə xətası:', err);
      setError(err.message);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadUsers')
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers };
};
