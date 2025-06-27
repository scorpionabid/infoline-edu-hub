import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData, UserRole } from '@/types/auth';

// Auth hadisələrini izləmək üçün listener əlavə edirik
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 [AuthStateChange]', { event, session: session?.user?.id });
});

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
      
      // Auth girişi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('📊 [Auth] Success Auth Response', { 
        userId: data.user.id, 
        email: data.user.email
      });

      // Fetch user profile with role (inner join əvəzinə normal join istifadə edirik)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role, region_id, sector_id, school_id)
        `)
        .eq('id', data.user.id)
        .single();

      // Ətraflı profil məlumatlarını log edirik
      console.log('👤 [Auth] Profile data:', profile);

      if (profileError) {
        console.error('❌ [Auth] Error fetching profile:', profileError);
        throw profileError;
      }

      // user_roles məlumatlarını yoxlayırıq
      console.log('🔍 [Auth] User roles raw data:', profile.user_roles);
      
      // Rol təyinatını dəqiqləşdiririk
      let userRole: UserRole = 'user' as UserRole; // default
      const isKnownSuperAdmin = data.user.email?.toLowerCase() === 'superadmin@infoline.az';
      
      if (isKnownSuperAdmin) {
        userRole = 'superadmin' as UserRole;
      } else if (profile?.user_roles && Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
        // Əgər user_roles massivdirsə
        userRole = (profile.user_roles[0].role || 'user') as UserRole;
      } else if (profile?.user_roles && typeof profile.user_roles === 'object' && profile.user_roles.role) {
        // Əgər user_roles obyektdirsə
        userRole = profile.user_roles.role as UserRole;
      }
      
      // Roll təyinatı haqqında ətraflı məlumat ver
      console.log('🔑 [Auth] Role determination', { 
        email: data.user.email, 
        isKnownSuperAdmin,
        profileExists: !!profile,
        userRolesData: profile?.user_roles,
        userRolesType: profile?.user_roles ? typeof profile.user_roles : 'undefined',
        finalRole: userRole 
      });

      // User məlumatlarını strukturlaşdırırıq
      // user_roles bir obyekt və ya massiv ola bilər, ona görə tipə görə işləyirik
      let regionId, sectorId, schoolId;
      
      if (Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
        regionId = profile.user_roles[0].region_id;
        sectorId = profile.user_roles[0].sector_id;
        schoolId = profile.user_roles[0].school_id;
      } else if (typeof profile.user_roles === 'object' && profile.user_roles !== null) {
        regionId = profile.user_roles.region_id;
        sectorId = profile.user_roles.sector_id;
        schoolId = profile.user_roles.school_id;
      }

      const userData: FullUserData = {
        id: profile.id,
        email: data.user.email || profile.email || '',
        full_name: profile.full_name || '',
        name: profile.full_name || '',
        role: userRole,
        region_id: regionId,
        sector_id: sectorId,
        school_id: schoolId,
        regionId: regionId,
        sectorId: sectorId,
        schoolId: schoolId,
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
        email: userData.email,
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
      console.log('🔄 [Auth] Initialization already completed, skipping...');
      return;
    }

    // Prevent concurrent initialization
    if (state.isLoading && !loginOnly) {
      console.log('🔄 [Auth] Initialization already in progress, skipping...');
      return;
    }

    set({ isLoading: true, initializationAttempted: true });
    console.log('🔄 [Auth] Starting initialization...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [Auth] Session error:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log('🔐 [Auth] Found session for user:', { userId: session.user.id, email: session.user.email });
        
        // Fetch user profile with role (inner join əvəzinə normal join istifadə edirik)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role, region_id, sector_id, school_id)
          `)
          .eq('id', session.user.id)
          .maybeSingle();

        // Ətraflı profil məlumatlarını log edirik
        console.log('👤 [Auth] Profile data for initialization:', profile);

        if (profileError) {
          console.error('❌ [Auth] Error fetching profile during initialization:', profileError);
          throw profileError;
        }

        if (profile) {
          // user_roles məlumatlarını yoxlayırıq
          console.log('🔍 [Auth] User roles raw data during initialization:', profile.user_roles);
          
          // Rol təyinatını dəqiqləşdiririk
          let userRole: UserRole = 'user' as UserRole; // default
          const isKnownSuperAdmin = session.user.email?.toLowerCase() === 'superadmin@infoline.az';
          
          if (isKnownSuperAdmin) {
            userRole = 'superadmin' as UserRole;
          } else if (profile?.user_roles && Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
            // Əgər user_roles massivdirsə
            userRole = (profile.user_roles[0].role || 'user') as UserRole;
          } else if (profile?.user_roles && typeof profile.user_roles === 'object' && profile.user_roles.role) {
            // Əgər user_roles obyektdirsə
            userRole = profile.user_roles.role as UserRole;
          }
          
          // Roll təyinatı haqqında ətraflı məlumat ver
          console.log('🔑 [Auth] Role determination during initialization', { 
            email: session.user.email, 
            isKnownSuperAdmin,
            profileExists: !!profile,
            userRolesData: profile?.user_roles,
            userRolesType: profile?.user_roles ? typeof profile.user_roles : 'undefined',
            finalRole: userRole 
          });

          // User məlumatlarını strukturlaşdırırıq
          // user_roles bir obyekt və ya massiv ola bilər, ona görə tipə görə işləyirik
          let regionId, sectorId, schoolId;
          
          if (Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
            regionId = profile.user_roles[0].region_id;
            sectorId = profile.user_roles[0].sector_id;
            schoolId = profile.user_roles[0].school_id;
          } else if (typeof profile.user_roles === 'object' && profile.user_roles !== null) {
            regionId = profile.user_roles.region_id;
            sectorId = profile.user_roles.sector_id;
            schoolId = profile.user_roles.school_id;
          }

          const userData: FullUserData = {
            id: profile.id,
            email: session.user.email || profile.email || '',
            full_name: profile.full_name || '',
            name: profile.full_name || '',
            role: userRole,
            region_id: regionId,
            sector_id: sectorId,
            school_id: schoolId,
            regionId: regionId,
            sectorId: sectorId,
            schoolId: schoolId,
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
          
          console.log('✅ [Auth] Initialization successful', { 
            userId: userData.id, 
            role: userData.role,
            email: userData.email,
            has_region_id: !!userData.region_id,
            has_sector_id: !!userData.sector_id, 
            has_school_id: !!userData.school_id 
          });
        } else {
          console.warn('⚠️ [Auth] Profile not found during initialization');
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            error: 'Profile not found'
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
    
    // Rol yoxlamalarını daha ətraflı loqlayırıq
    console.log('🔒 [Auth] Checking permission', { 
      permission: _permission,
      userRole: user.role,
      email: user.email
    });
    
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
  const emailBasedRole = state.user?.email?.toLowerCase().includes('superadmin') ? 'superadmin' as UserRole : null;
  
  // Rol təyini prioriteti: 
  // 1. Profildəki rol (user_roles cədvəlindən gəlir)
  // 2. Email əsasında rol (superadmin emaili olduqda)
  // 3. Default rol (user)
  return state.user?.role || emailBasedRole || ('user' as UserRole);
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
