
import { useState, useCallback, useEffect } from 'react';
import { User } from '@/components/users/UserSelectParts/types';

// Mock users data
const mockUsers: User[] = [
  { id: '1', full_name: 'John Doe', email: 'john@example.com' },
  { id: '2', full_name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', full_name: 'Michael Johnson', email: 'michael@example.com' },
  { id: '4', full_name: 'Emily Davis', email: 'emily@example.com' },
  { id: '5', full_name: 'Robert Wilson', email: 'robert@example.com' },
];

export const useUsers = (excludeIds: string[] = []) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data istifadə edək, real layihədə API-yə sorğu olacaq
      // await new Promise(resolve => setTimeout(resolve, 500)); // Yükləmə effekti üçün
      
      const filteredUsers = mockUsers.filter(user => !excludeIds.includes(user.id));
      setUsers(filteredUsers);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [excludeIds]);

  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUserId(userId);
    
    if (userId) {
      const selectedUser = users.find(user => user.id === userId) || null;
      setSelectedUserData(selectedUser);
    } else {
      setSelectedUserData(null);
    }
  }, [users]);

  // İlk yükləmə
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    selectedUserId,
    selectedUserData,
    setSelectedUserId: handleUserSelect,
    fetchUsers,
  };
};
