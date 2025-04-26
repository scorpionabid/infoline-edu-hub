
import { createContext, ReactNode, useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => false,
  logout: async () => false,
  resetPassword: async () => false,
  updateProfile: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // İlkin autentifikasiya yoxlaması
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Bu hissə real implementasiyada Supabase ilə əvəz olunmalıdır
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Giriş funksiyası
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Burada müvəqqəti mock data istifadə edirik, ancaq real implementasiyada
      // bu, Supabase və ya başqa bir autentifikasiya sistemi ilə əvəz olunmalıdır
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const mockUser: UserProfile = {
          id: '1',
          fullName: 'Test User',
          email,
          role: 'superadmin',
          avatarUrl: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff'
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
      }
      
      throw new Error('Invalid credentials');
    } catch (err) {
      console.error('Login error:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Çıxış funksiyası
  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Bu hissə real implementasiyada Supabase ilə əvəz olunmalıdır
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Şifrə sıfırlama funksiyası
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Burada müvəqqəti mock data istifadə edirik, ancaq real implementasiyada
      // bu, Supabase və ya başqa bir sistem ilə əvəz olunmalıdır
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Password reset requested for: ${email}`);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Profil yeniləmə funksiyası
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Bu hissə real implementasiyada Supabase ilə əvəz olunmalıdır
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      
      throw new Error('No user logged in');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
