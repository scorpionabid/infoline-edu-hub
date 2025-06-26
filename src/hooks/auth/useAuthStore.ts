import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData } from '@/types/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  session: null,
  initialized: false,
  initializationAttempted: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔐 [Auth] Attempting sign in', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role, region_id, sector_id, school_id)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      const userRole = profile.user_roles?.role || 'schooladmin';

      const userData: FullUserData = {
        id: profile.id,
        email: data.user.email || profile.email || '',
        full_name: profile.full_name || '',
        name: profile.full_name || '',
        role: userRole,
        region_id: profile.user_roles?.region_id,
        sector_id: profile.user_roles?.sector_id,
        school_id: profile.user_roles?.school_id,
        regionId: profile.user_roles?.region_id,
        sectorId: profile.user_roles?.sector_id,
        schoolId: profile.user_roles?.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language || 'az',
        avatar: profile.avatar,
        status: profile.status || 'active',
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };

      set({
        user: userData,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true
      });

      console.log('✅ [Auth] Sign in successful', { 
        userId: userData.id, 
        role: userData.role,
        has_region_id: !!userData.region_id,
        has_sector_id: !!userData.sector_id, 
        has_school_id: !!userData.school_id 
      });
    } catch (error: any) {
      console.error('❌ [Auth] Sign in failed', { error: error.message });
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
        initialized: true
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        initialized: true
      });

      console.log('🔓 [Auth] Sign out successful');
    } catch (error: any) {
      console.error('❌ [Auth] Sign out failed', { error: error.message });
      set({ isLoading: false, error: error.message });
    }
  },

  logout: async () => {
    await get().signOut();
  },

  login: async (email: string, password: string) => {
    await get().signIn(email, password);
  },

  fetchUser: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const user = data.user;

    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(role, region_id, sector_id, school_id)
      `)
      .eq('id', user.id)
      .single();

    if (profile) {
      const userRole = profile.user_roles?.role || 'schooladmin';

      const userData: FullUserData = {
        id: profile.id,
        email: user.email || profile.email || '',
        full_name: profile.full_name || '',
        name: profile.full_name || '',
        role: userRole,
        region_id: profile.user_roles?.region_id,
        sector_id: profile.user_roles?.sector_id,
        school_id: profile.user_roles?.school_id,
        regionId: profile.user_roles?.region_id,
        sectorId: profile.user_roles?.sector_id,
        schoolId: profile.user_roles?.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language || 'az',
        avatar: profile.avatar,
        status: profile.status || 'active',
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };

      set({ user: userData });
    }
  },

  updateUser: (userData: Partial<FullUserData>) => {
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: async (loginOnly = false): Promise<void> => {
    const state = get();
    
    // Prevent multiple initialization attempts
    if (state.initialized && !loginOnly) {
      return;
    }

    // Prevent concurrent initialization
    if (state.isLoading && !loginOnly) {
      return;
    }

    set({ isLoading: true, initializationAttempted: true });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (session?.user) {
        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles!inner(role, region_id, sector_id, school_id)
          `)
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile && !profileError) {
          const userRole = profile.user_roles?.role || 'schooladmin';

          const userData: FullUserData = {
            id: profile.id,
            email: session.user.email || profile.email || '',
            full_name: profile.full_name || '',
            name: profile.full_name || '',
            role: userRole,
            region_id: profile.user_roles?.region_id,
            sector_id: profile.user_roles?.sector_id,
            school_id: profile.user_roles?.school_id,
            regionId: profile.user_roles?.region_id,
            sectorId: profile.user_roles?.sector_id,
            schoolId: profile.user_roles?.school_id,
            phone: profile.phone,
            position: profile.position,
            language: profile.language || 'az',
            avatar: profile.avatar,
            status: profile.status || 'active',
            last_login: profile.last_login,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            lastLogin: profile.last_login,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          };

          set({
            user: userData,
            session,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
            error: null
          });
          
          console.log('✅ [Auth] Initialization successful', { userId: userData.id, role: userData.role });
        } else {
          console.warn('Profile not found or error:', profileError);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            error: profileError?.message || 'Profile not found'
          });
        }
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
          error: null
        });
        console.log('🔓 [Auth] No active session');
      }
    } catch (error: any) {
      console.error('❌ [Auth] Initialization failed', { error: error.message });
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
        initialized: true
      });
    }
  },

  updateProfile: async (updates: Partial<FullUserData>) => {
    try {
      const state = get();
      if (!state.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));

      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  },

  hasPermission: (_permission: string) => {
    const _state = get();
    // Basic permission check 
    const { user } = get();
    if (!user) return false;
    
    // Superadmin hesab üçün çoxsahli yoxlama
    if (user.role === 'superadmin') return true;
    
    // Email əsasli superadmin yoxlaması
    if (user.email?.toLowerCase().includes('superadmin')) return true;
    
    return false;
  }
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => {
  // Əgər istifadəçi emaili superadmin sözünü ehtiva edirsə, superadmin rol
  const emailBasedRole = state.user?.email?.toLowerCase().includes('superadmin') ? 'superadmin' : null;
  
  // Rol təyini prioriteti: 
  // 1. Profildəki rol (user_roles cədvəlindən gəlir)
  // 2. Email əsasında rol (superadmin emaili olduqda)
  // 3. Default rol (user)
  return state.user?.role || emailBasedRole || 'user';
};
export const selectRegionId = (state: AuthState) => state.user?.region_id;
export const selectSectorId = (state: AuthState) => state.user?.sector_id;
export const selectSchoolId = (state: AuthState) => state.user?.school_id;
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectHasPermission = (state: AuthState) => state.hasPermission;
export const selectSignOut = (state: AuthState) => state.signOut;

// Helper functions
export const shouldAuthenticate = (route: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !publicRoutes.includes(route);
};

export const isProtectedRoute = (route: string): boolean => {
  return shouldAuthenticate(route);
};

export const getRedirectPath = (userRole: string): string => {
  switch (userRole) {
    case 'superadmin': {
      return '/dashboard';
    }
    case 'regionadmin': {
      return '/dashboard';
    }
    case 'sectoradmin': {
      return '/dashboard';
    }
    case 'schooladmin': {
      return '/dashboard';
    }
    default:
      return '/dashboard';
  }
};
