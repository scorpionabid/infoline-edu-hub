
import { useState } from 'react';

export function useUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Implement actual logic when needed

  return {
    users,
    loading,
    error
  };
}
