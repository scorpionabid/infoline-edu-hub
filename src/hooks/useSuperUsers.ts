
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface SuperUser {
  id: string;
  email: string;
  fullName: string;
}

export const useSuperUsers = () => {
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuperUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Burada real API çağırışı olacaq
      // Müvəqqəti olaraq boş massiv qaytarırıq
      // const response = await fetch('/api/users/super');
      // const data = await response.json();
      // setUsers(data);
      setUsers([]);
    } catch (err: any) {
      console.error('Super istifadəçilər yüklənərkən xəta:', err);
      setError(err.message || 'Super istifadəçilər yüklənərkən xəta baş verdi');
      toast.error('Super istifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuperUsers();
  }, [fetchSuperUsers]);

  return {
    users,
    loading,
    error,
    refresh: fetchSuperUsers
  };
};

export default useSuperUsers;
