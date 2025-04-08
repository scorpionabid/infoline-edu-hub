
export interface User {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

export interface UserSelectDataResult {
  users: User[];
  loading: boolean; 
  error: string | null;
  selectedUserData: User | null;
  fetchUsers: () => Promise<void>;
}
