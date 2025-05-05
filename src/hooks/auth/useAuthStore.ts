
import { create } from 'zustand';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Auth state idarəetməsi üçün zustand store
 */
interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // State değiştirme fonksiyonları
  setSession: (session: Session | null) => void;
  setUser: (user: FullUserData | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setError: (error: string | null) => void;
  resetAuth: () => void;
  
  // Auth operasyonları
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<FullUserData | null>;
  clearError: () => void;
}

// Cache ayarları
const USER_CACHE_KEY = 'auth_user_cache';
const SESSION_CACHE_KEY = 'auth_session_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 dəqiqə

// Keşdən istifadəçini əldə etmək
const getCachedUser = (): FullUserData | null => {
  try {
    const cachedStr = localStorage.getItem(USER_CACHE_KEY);
    if (!cachedStr) return null;
    
    const cached = JSON.parse(cachedStr);
    const now = Date.now();
    
    if (cached.expiry && cached.expiry > now) {
      return cached.user;
    }
    
    // Vaxtı bitmiş keşi təmizləyirik
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  } catch (e) {
    console.warn('User cache parsing error:', e);
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  }
};

// Keşdə istifadəçini saxlamaq
const setCachedUser = (user: FullUserData | null): void => {
  try {
    if (!user) {
      localStorage.removeItem(USER_CACHE_KEY);
      return;
    }
    
    const expiry = Date.now() + CACHE_EXPIRY_MS;
    localStorage.setItem(
      USER_CACHE_KEY,
      JSON.stringify({ user, expiry })
    );
  } catch (e) {
    console.warn('User cache writing error:', e);
  }
};

// Keşdən sessiyani əldə etmək
const getCachedSession = (): Session | null => {
  try {
    const cachedStr = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cachedStr) return null;
    
    const cached = JSON.parse(cachedStr);
    const now = Date.now();
    
    if (cached.expiry && cached.expiry > now) {
      return cached.session;
    }
    
    // Vaxtı bitmiş keşi təmizləyirik
    localStorage.removeItem(SESSION_CACHE_KEY);
    return null;
  } catch (e) {
    console.warn('Session cache parsing error:', e);
    localStorage.removeItem(SESSION_CACHE_KEY);
    return null;
  }
};

// Keşdə sessiyani saxlamaq
const setCachedSession = (session: Session | null): void => {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_CACHE_KEY);
      return;
    }
    
    const expiry = Date.now() + CACHE_EXPIRY_MS;
    localStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({ session, expiry })
    );
  } catch (e) {
    console.warn('Session cache writing error:', e);
  }
};

// İstifadəçi məlumatlarını fetch etmək
const fetchUserData = async (userId: string, currentSession: Session): Promise<FullUserData | null> => {
  try {
    // Tokeni yeniləyirik
    try {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token || ''
      });
    } catch (e) {
      console.warn('Session token update failed:', e);
    }

    // Parallel olaraq user_roles və profile əldə edirik
    const [roleResult, profileResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .maybeSingle(),
        
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
    ]);

    // User role məlumatlarını alırıq
    const userRole = roleResult.data?.role || 'user';
    const regionId = roleResult.data?.region_id;
    const sectorId = roleResult.data?.sector_id;
    const schoolId = roleResult.data?.school_id;
    
    // Profile məlumatları
    let profile = profileResult.data;
    
    // Əgər profil tapılmadısa, yaradaq
    if (!profile) {
      try {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: currentSession.user.email,
            full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        profile = newProfile;
      } catch (e) {
        console.error('Profile creation failed:', e);
        // Default profil yaradırıq əgər yaratma əməliyyatı uğursuz olsa
        profile = {
          id: userId,
          email: currentSession.user.email,
          full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    // İstifadəçi məlumatlarını birləşdiririk
    const userData: FullUserData = {
      id: userId,
      email: currentSession.user.email || '',
      role: userRole,
      region_id: regionId,
      sector_id: sectorId,
      school_id: schoolId,
      regionId: regionId,
      sectorId: sectorId,
      schoolId: schoolId,
      name: profile?.full_name || '',
      full_name: profile?.full_name || '',
      avatar: profile?.avatar || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      language: profile?.language || 'az',
      status: profile?.status || 'active',
      lastLogin: profile?.last_login || null,
      last_login: profile?.last_login || null,
      createdAt: profile?.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || new Date().toISOString(),
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString(),
      adminEntity: {
        type: userRole,
        name: profile?.full_name || '',
        schoolName: '',
        sectorName: '',
        regionName: ''
      },
      notificationSettings: {
        email: true,
        system: true
      }
    };

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Auth state idarəetmə store-u
 */
export const useAuthStore = create<AuthState>((set, get) => {
  // İlkin state
  const initialState = {
    user: getCachedUser(),
    session: getCachedSession(),
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null
  };

  // İstifadəçi və sessiya əsasında autentifikasiya vəziyyətini hesablayırıq
  initialState.isAuthenticated = !!(initialState.user && initialState.session);

  return {
    ...initialState,
    
    // State setters
    setSession: (session) => {
      setCachedSession(session);
      set({ 
        session,
        isAuthenticated: !!(session && get().user)
      });
    },
    
    setUser: (user) => {
      setCachedUser(user);
      set({ 
        user,
        isAuthenticated: !!(user && get().session)
      });
    },
    
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsInitialized: (isInitialized) => set({ isInitialized }),
    setError: (error) => set({ error }),
    
    resetAuth: () => {
      setCachedUser(null);
      setCachedSession(null);
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false,
        error: null
      });
    },
    
    // Auth əməliyyatları
    login: async (email, password) => {
      try {
        set({ isLoading: true, error: null });
        
        // Login əməliyyatı
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error.message);
          set({ error: error.message, isLoading: false });
          return false;
        }
        
        if (!data.session || !data.user) {
          set({ error: 'Giriş uğursuz oldu: Session və ya istifadəçi məlumatları əldə edilmədi', isLoading: false });
          return false;
        }
        
        // Sessiyani təyin edirik
        set({ session: data.session });
        setCachedSession(data.session);
        
        // İstifadəçi məlumatlarını əldə edirik
        const userData = await fetchUserData(data.user.id, data.session);
        
        if (userData) {
          // İstifadəçini təyin edirik
          set({ 
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true
          });
          setCachedUser(userData);
          
          // Last login update etmək
          try {
            await supabase
              .from('profiles')
              .update({ 
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', userData.id);
          } catch (e) {
            console.warn('Failed to update last_login:', e);
          }
          
          return true;
        } else {
          set({ 
            error: 'İstifadəçi məlumatları əldə edilmədi',
            isLoading: false
          });
          return false;
        }
      } catch (err: any) {
        console.error('Login exception:', err);
        set({ 
          error: err.message || 'Giriş zamanı xəta baş verdi',
          isLoading: false
        });
        return false;
      }
    },
    
    logout: async () => {
      try {
        set({ isLoading: true });
        
        await supabase.auth.signOut();
        
        setCachedUser(null);
        setCachedSession(null);
        
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        toast.success('Sistemdən uğurla çıxış edildi');
      } catch (err: any) {
        console.error('Logout error:', err);
        set({
          error: err.message || 'Çıxış zamanı xəta baş verdi',
          isLoading: false
        });
      }
    },
    
    refreshAuth: async () => {
      try {
        set({ isLoading: true });
        
        // Session məlumatlarını yeniləyirik
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          throw error || new Error('Session məlumatları əldə edilmədi');
        }
        
        // Session-u təyin edirik
        set({ session: data.session });
        setCachedSession(data.session);
        
        // İstifadəçi məlumatlarını əldə edirik
        const userData = await fetchUserData(data.session.user.id, data.session);
        
        if (userData) {
          set({ 
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true
          });
          setCachedUser(userData);
          return userData;
        } else {
          set({ 
            error: 'İstifadəçi məlumatları əldə edilmədi',
            isLoading: false
          });
          return null;
        }
      } catch (err: any) {
        console.error('Auth refresh error:', err);
        set({ 
          error: err.message || 'Autentifikasiya yeniləmə xətası',
          isLoading: false
        });
        return null;
      }
    },
    
    clearError: () => set({ error: null })
  };
});
