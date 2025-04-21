
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  status?: string;
  created_at?: string;
  avatar?: string;
}

export interface UserSelectCommandProps {
  users: User[];
  loading: boolean;
  error: string | null;
  value: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (userId: string) => void;
}

export interface UserErrorStateProps {
  error: string;
}

export interface UserEmptyStateProps {
  searchTerm: string;
}

export interface UserLoadingStateProps {
  searchTerm: string;
}

export interface UserSelectedStateProps {
  user: User | null;
  onClear: () => void;
}
