
export interface User {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string;  
  language?: "az" | "en" | "ru" | "tr";
  status?: "active" | "inactive" | "blocked";
  created_at?: string;
  updated_at?: string;
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
