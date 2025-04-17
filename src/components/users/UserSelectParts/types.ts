
export interface User {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string;  // ExistingUserSectorAdminDialog üçün əlavə edildi
}

export interface UserSelectDataResult {
  users: User[];
  loading: boolean; 
  error: string | null;
  selectedUserData: User | null;
  fetchUsers: () => Promise<void>;
}

// UserFilter tipi əlavə edildi
export interface UserFilter {
  role: string[];
  status: string[];
  region: string[];
  sector: string[];
  school: string[];
}
