
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

// User roles
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  avatar?: string;
  lastLogin?: Date;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo purposes (in a real app, this would come from an API)
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@infoline.edu',
    role: 'superadmin',
    avatar: '',
  },
  {
    id: '2',
    name: 'Baku Region Admin',
    email: 'regionadmin@infoline.edu',
    role: 'regionadmin',
    regionId: '1',
    avatar: '',
  },
  {
    id: '3',
    name: 'Yasamal Sector Admin',
    email: 'sectoradmin@infoline.edu',
    role: 'sectoradmin',
    regionId: '1',
    sectorId: '1',
    avatar: '',
  },
  {
    id: '4',
    name: 'School 45 Admin',
    email: 'schooladmin@infoline.edu',
    role: 'schooladmin',
    regionId: '1',
    sectorId: '1',
    schoolId: '1',
    avatar: '',
  },
];

// Context provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, we would validate the token with the backend
        const savedUser = localStorage.getItem('infoline-user');
        
        if (savedUser) {
          const user = JSON.parse(savedUser) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, we would make an API call to validate credentials
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (user && password === '123456') { // Demo password
        // Update user with current login time
        const updatedUser = {
          ...user,
          lastLogin: new Date()
        };
        
        // Save to localStorage (in a real app, we would store a token)
        localStorage.setItem('infoline-user', JSON.stringify(updatedUser));
        
        setState({
          user: updatedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast.success('Login successful', {
          description: `Welcome back, ${updatedUser.name}!`
        });
        
        return true;
      } else {
        toast.error('Login failed', {
          description: 'Invalid email or password'
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'An unexpected error occurred'
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('infoline-user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.info('Logged out successfully');
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('infoline-user', JSON.stringify(updatedUser));
      setState({
        ...state,
        user: updatedUser,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook to check for specific role
export const useRole = (role: Role | Role[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};
