
import { create } from 'zustand';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { devtools } from 'zustand/middleware';

// Cache Constants
const USER_CACHE_KEY = 'auth_user_cache';
const SESSION_CACHE_KEY = 'auth_session_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 dəqiqə

// Anti-loop məntiqini əlavə edək
const EVENT_THROTTLE_MS = 500;
let lastAuthEvent = 0;
let lastEventType = '';
let eventCounter = 0;
let authSubscription = null;

interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // State dəyişmə funksiyaları
  setSession: (session: Session | null) => void;
  setUser: (user: FullUserData | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setError: (error: string | null) => void;
  resetAuth: () => void;
  
  // Auth əməliyyatları
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<FullUserData | null>;
  clearError: () => void;
  
  // Debug funksiyaları
  getState: () => AuthState;
}

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
    // Paralel olaraq user_roles və profile əldə edirik
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

// Auth hadisəsinin işlənməsini yoxlayan və throttle edən funksiya
const shouldHandleAuthEvent = (event: string, session: Session | null) => {
  const now = Date.now();
  
  // Eyni event növü çox qısa müddətdə təkrarlanırsa, rədd edirik
  if (lastEventType === event && now - lastAuthEvent < EVENT_THROTTLE_MS) {
    eventCounter++;
    
    // Eyni hadisənin çox təkrarlanmasını aşkarlasaq, listener yenidən qurulmalıdır
    if (eventCounter > 10) {
      // Bu çox ciddi bir vəziyyətdir, bəlkə yenidən quraşdırmaq lazımdır
      console.warn('Auth event loop detected, reinitializing listener');
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
        eventCounter = 0;
        // Timeout ilə listener yenidən quraşdıraq
        setTimeout(() => setupAuthListener(), 1000);
      }
      return false;
    }
    
    // Eyni eventi çox tez-tez emal etməkdən imtina edirik
    return false;
  }
  
  // Yeni event və ya kifayət qədər vaxt keçibsə, onu qeyd edirik
  lastAuthEvent = now;
  lastEventType = event;
  eventCounter = event === lastEventType ? eventCounter : 0;
  return true;
};

// Auth listener quruluşu
const setupAuthListener = (set, get) => {
  // Əvvəlki dinləyicini təmizləyək
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }
    
  // Yeni dinləyici yaradırıq
  const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
    // Event hadisəsini throttle edirik
    if (!shouldHandleAuthEvent(event, currentSession)) {
      return;
    }
      
    console.log('Auth state changed:', event, currentSession ? 'Session var' : 'Session yoxdur');
      
    // Session statusunu yeniləyirik
    set((state) => {
      // Eyni session ID olub-olmadığını yoxlayırıq
      if (
        state.session?.access_token === currentSession?.access_token && 
        state.session?.refresh_token === currentSession?.refresh_token
      ) {
        // Session eynidir, dəyişiklik etmirik
        return state;
      }
        
      // Session yeniləyirik
      setCachedSession(currentSession);
      return { 
        ...state, 
        session: currentSession,
        isAuthenticated: !!(currentSession && state.user)
      };
    });
      
    // Event handling
    if (event === 'SIGNED_IN') {
      if (currentSession) {
        // İstifadəçi məlumatlarını əldə etmək üçün setTimeout istifadə edirik
        // Bu auth callback içində başqa Supabase sorğusu etməmək üçündür
        setTimeout(async () => {
          try {
            set({ isLoading: true });
            const userData = await fetchUserData(currentSession.user.id, currentSession);
              
            if (userData) {
              setCachedUser(userData);
              set({ 
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true
              });
                
              // Last login update etmək - amma sorğuların axışını kəsməmək üçün 
              // ayrı bir timeout ilə edirik
              setTimeout(async () => {
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
              }, 500);
            } else {
              set({ isLoading: false });
            }
          } catch (err) {
            console.error('Error fetching user data after sign in:', err);
            set({ isLoading: false });
          }
        }, 100);
      }
    } else if (event === 'TOKEN_REFRESHED') {
      // Token yeniləndi, state-i yeniləyirik
      // Lakin yalnız session dəyişir, user məlumatları saxlanılır
    } else if (event === 'SIGNED_OUT') {
      set({ 
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
      setCachedUser(null);
      setCachedSession(null);
    }
  });
    
  authSubscription = data.subscription;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => {
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
  
      // Auth listener quruluşu
      setupAuthListener(set, get);
      
      // Əvvəlcədən sessiya yoxlaması
      setTimeout(async () => {
        try {
          const { data } = await supabase.auth.getSession();
          console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
          
          if (!data.session) {
            set({ isLoading: false });
          }
          // Əgər session varsa, auth listener özü məlumatları yeniləyəcək
        } catch (err) {
          console.error('Initial session check error:', err);
          set({ isLoading: false });
        }
      }, 0);
  
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
            
            // Auth listener məlumatları avtomatik yeniləyəcək
            return true;
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
            
            // Əvvəlcə auth listener-ları təmizləyək
            if (authSubscription) {
              authSubscription.unsubscribe();
              authSubscription = null;
            }
            
            await supabase.auth.signOut();
            
            setCachedUser(null);
            setCachedSession(null);
            
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false
            });
            
            // Yenidən auth listener quruluşu
            setupAuthListener(set, get);
            
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
              set({ 
                isLoading: false,
                isInitialized: true
              });
              return null;
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
                isLoading: false,
                isInitialized: true
              });
              return null;
            }
          } catch (err: any) {
            console.error('Auth refresh error:', err);
            set({ 
              error: err.message || 'Autentifikasiya yeniləmə xətası',
              isLoading: false,
              isInitialized: true
            });
            return null;
          }
        },
        
        clearError: () => set({ error: null }),
        
        // Debug funksiyası
        getState: () => get()
      };
    },
    {
      name: 'auth-store',
      enabled: true
    }
  )
);

// İlk yüklənmə zamanı sessiyanı yoxlayıb yükləyirik
// Lakin bir promise qarşısını almaq üçün bunu dərhal yox, 
// başqa işlər yekunlaşdıqdan sonra edirik
setTimeout(async () => {
  const { refreshAuth } = useAuthStore.getState();
  await refreshAuth();
}, 100);
