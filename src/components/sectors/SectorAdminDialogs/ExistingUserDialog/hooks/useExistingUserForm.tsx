
import { useState, useEffect } from 'react';
import { User, UserFilter } from '@/types/user';

export const useExistingUserForm = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({
    role: '',
    region: '',
    search: ''
  });

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock users data
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          full_name: 'İstifadəçi 1',
          phone: '+994501234567',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    return fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    totalPages: 1,
    currentPage: 1,
    setCurrentPage: () => {},
    hasNextPage: false,
    hasPreviousPage: false,
    fetchUsers,
    fetchAvailableUsers
  };
};
