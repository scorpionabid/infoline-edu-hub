import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, FullUserData, UserRole } from '@/types/auth';

// Session timeout handling - global variables
let sessionTimeoutCleaner: number | null = null;
let initRetryCount = 0;
const MAX_RETRIES = 3;
const INIT_TIMEOUT = 30000; // 30 seconds - much more reasonable for auth initialization
const RETRY_DELAY = 5000; // 5 seconds between retries

// Auth hadisələrini izləmək üçün təkmilləşdirilmiş listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 [AuthStateChange]', { event, session: session?.user?.id });
  
  // Handle only essential events to prevent loops
  switch (event) {
    case 'INITIAL_SESSION':
    case 'SIGNED_IN':
      if (session?.user) {
        console.log('🔄 [AuthStateChange] Processing session:', event);
        const state = useAuthStore.getState();
        
        // Clear any existing timeout for session cleanup
        if (sessionTimeoutCleaner) {
          clearTimeout(sessionTimeoutCleaner);
          sessionTimeoutCleaner = null;
        }
        
        // Setupu automatic session refresh checker
        setupSessionTimeout(session);
        
        // Only process if we don't already have a user or if state is currently loading
        if ((!state.user && !state.isLoading) || state.isLoading) {
          console.log('🔄 [AuthStateChange] Initializing user from session');
          await state.performInitialization(true);
        }
      }
      break;
      
    case 'SIGNED_OUT':
      console.log('🔄 [AuthStateChange] User signed out, clearing state');
      // Clear any existing timeout for session cleanup
      if (sessionTimeoutCleaner) {
        clearTimeout(sessionTimeoutCleaner);
        sessionTimeoutCleaner = null;
      }
      
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
        initialized: true,
        isLoading: false,
        initializationAttempted: true
      });
      break;
      
    case 'TOKEN_REFRESHED':
      console.log('🔄 [AuthStateChange] Token refreshed');
      if (session) {
        // Reset the session timeout when token is refreshed
        if (sessionTimeoutCleaner) {
          clearTimeout(sessionTimeoutCleaner);
          sessionTimeoutCleaner = null;
        }
        setupSessionTimeout(session);
        
        // Update session in state
        useAuthStore.setState({ session });
      }
      break;
      
    case 'USER_UPDATED':
      if (session?.user) {
        console.log('🔄 [AuthStateChange] User updated, refreshing profile');
        const state = useAuthStore.getState();
        if (state.user) {
          state.fetchUser();
        }
      }
      break;
  }
});

// Setup session timeout checker
function setupSessionTimeout(session: any) {
  // Get expiry from session if available
  const expiresAt = session?.expires_at || 0;
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate time until 10 minutes before expiry (more conservative)
  const timeUntilRefresh = expiresAt ? (expiresAt - now - 600) * 1000 : 3600000; // Default 1h
  
  // Ensure refresh time is reasonable (between 5 minutes and 12 hours)
  const normalizedRefreshTime = Math.min(
    Math.max(timeUntilRefresh, 5 * 60 * 1000), // At least 5 minutes
    12 * 60 * 60 * 1000 // Max 12 hours
  );
  
  console.log(`🕒 [Auth] Session expiry check scheduled in ${Math.floor(normalizedRefreshTime/60000)} minutes`);
  
  // Setup timeout to check session before it expires
  // Clear existing timeout if there is one
  if (sessionTimeoutCleaner) {
    clearTimeout(sessionTimeoutCleaner);
    sessionTimeoutCleaner = null;
  }
  
  sessionTimeoutCleaner = window.setTimeout(() => {
    console.log('🔄 [Auth] Checking session validity before expiry');
    const state = useAuthStore.getState();
    
    // Only reset loading state if it's been stuck for a while
    if (state.isLoading) {
      const loadingStart = state.loadingStartTime || 0;
      const loadingDuration = Date.now() - loadingStart;
      
      if (loadingDuration > 30000) { // 30 seconds
        console.warn(`⚠️ [Auth] Detected stuck loading state for ${Math.floor(loadingDuration/1000)}s, resetting`);
        useAuthStore.setState({ isLoading: false });
      }
    }
    
    // Silent refresh - try to refresh the token without user interaction
    supabase.auth.refreshSession().then(({ data, error }) => {
      if (error) {
        console.warn('⚠️ [Auth] Silent refresh failed, falling back to full initialization', error);
        state.performInitialization(false);
      } else if (data.session) {
        console.log('✅ [Auth] Session refreshed successfully');
        useAuthStore.setState({ session: data.session });
        setupSessionTimeout(data.session); // Setup next refresh cycle
      }
    });
  }, normalizedRefreshTime);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false, // Start with false to prevent endless loading
  isAuthenticated: false,
  error: null,
  session: null,
  initialized: false,
  initializationAttempted: false,

  signIn: async (email: string, password: string) => {
    // Prevent sign-in attempts if one is already in progress
    const state = get();
    if (state.isLoading && state.signInAttemptTime && Date.now() - state.signInAttemptTime < 20000) {
      console.warn('⚠️ [Auth] Sign-in already in progress, please wait...');
      return;
    }
    
    set({ isLoading: true, error: null, signInAttemptTime: Date.now() });
    
    try {
      console.log('🔐 [Auth] Attempting sign in', { email });
      
      // Set a sign-in timeout to prevent indefinite loading
      const signInTimeout = setTimeout(() => {
        const currentState = get();
        if (currentState.isLoading && currentState.signInAttemptTime) {
          console.warn('⚠️ [Auth] Sign-in timed out after 20s');
          set({ 
            isLoading: false, 
            error: 'Giriş vaxtı bitdi. Zəhmət olmasa, yenidən cəhd edin.',
            signInAttemptTime: null
          });
        }
      }, 20000); // 20 second timeout
      
      // Auth girişi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Clear the timeout since we got a response
      clearTimeout(signInTimeout);

      if (error) throw error;

      console.log('📊 [Auth] Success Auth Response', { 
        userId: data.user.id, 
        email: data.user.email
      });
      
      // Reset the sign-in attempt time
      set({ signInAttemptTime: null });

      // Fetch user profile with role (maybeSingle istifadə edirik)
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

      // user_roles məlumatlarını normalize edirik
      console.log('🔍 [Auth] User roles raw data:', profile?.user_roles);
      
      // Rol təyinatını dəqiqləşdiririk - robust role detection
      let userRole: UserRole = 'user' as UserRole; // default
      let regionId, sectorId, schoolId;
      
      const isKnownSuperAdmin = data.user.email?.toLowerCase() === 'superadmin@infoline.az';
      
      if (isKnownSuperAdmin) {
        userRole = 'superadmin' as UserRole;
      } else if (profile?.user_roles) {
        // Normalize user_roles - həm array həm də object case-lərini handle edirik
        const roleData = Array.isArray(profile.user_roles) 
          ? profile.user_roles[0] 
          : profile.user_roles;
          
        if (roleData?.role) {
          userRole = roleData.role as UserRole;
          regionId = roleData.region_id;
          sectorId = roleData.sector_id;
          schoolId = roleData.school_id;
        }
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

      // Role data artıq yuxarıda extract edilib

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
      console.error('❌ [Auth] Sign in failed', { 
        error: error.message, 
        code: error.code || 'unknown',
        details: error.details || 'No additional details'
      });
      
      // Enhanced error handling with user-friendly messages
      let userFriendlyError = 'Giriş xətası baş verdi';
      
      if (error.message?.includes('Invalid login credentials')) {
        userFriendlyError = 'E-poçt və ya şifrə səhvdir';
      } else if (error.message?.includes('Email not confirmed')) {
        userFriendlyError = 'E-poçt təsdiqlənməyib. Zəhmət olmasa e-poçtunuzu yoxlayın';
      } else if (error.message?.includes('Too many requests')) {
        userFriendlyError = 'Çox təz-təz cəhd edir. Zəhmət olmasa bir az gözləyin';
      } else if (error.message?.includes('Network')) {
        userFriendlyError = 'Şəbəkə bağlantısı xətası. Zəhmət olmasa yenidən cəhd edin';
      }
      
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: userFriendlyError,
        initialized: true
      });
      throw new Error(userFriendlyError);
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
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user) {
        console.log('⚠️ [Auth] No user found during fetchUser');
        return;
      }
      
      const user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role, region_id, sector_id, school_id)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [Auth] Error fetching profile in fetchUser:', profileError);
        return;
      }

      if (profile) {
        // Normalize user_roles - robust approach
        let userRole: UserRole = 'user' as UserRole;
        let regionId, sectorId, schoolId;
        
        const isKnownSuperAdmin = user.email?.toLowerCase() === 'superadmin@infoline.az';
        
        if (isKnownSuperAdmin) {
          userRole = 'superadmin' as UserRole;
        } else if (profile?.user_roles) {
          const roleData = Array.isArray(profile.user_roles) 
            ? profile.user_roles[0] 
            : profile.user_roles;
            
          if (roleData?.role) {
            userRole = roleData.role as UserRole;
            regionId = roleData.region_id;
            sectorId = roleData.sector_id;
            schoolId = roleData.school_id;
          }
        }

        const userData: FullUserData = {
          id: profile.id,
          email: user.email || profile.email || '',
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

        set({ user: userData });
        console.log('✅ [Auth] fetchUser successful', { userId: userData.id, role: userData.role });
      }
    } catch (error: any) {
      console.error('❌ [Auth] fetchUser failed:', error);
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
    
    // Prevent concurrent initialization
    if (state.isLoading) {
      console.log('🔄 [Auth] Already loading, skipping initialization');
      return;
    }
    
    // If already initialized with user, skip
    if (state.initialized && state.user && !loginOnly) {
      console.log('🔄 [Auth] Already initialized with user, skipping');
      return;
    }
    
    await get().performInitialization(loginOnly);
  },

  performInitialization: async (loginOnly = false): Promise<void> => {
    const state = get();
    
    // Add timeout protection with retry mechanism
    const initTimeout = setTimeout(() => {
      const currentState = get();
      if (currentState.isLoading) {
        console.warn(`⚠️ [Auth] Initialization timed out after ${INIT_TIMEOUT/1000}s`);
        
        // Try to retry initialization a few times before giving up
        if (initRetryCount < MAX_RETRIES) {
          initRetryCount++;
          console.log(`🔄 [Auth] Retrying initialization (attempt ${initRetryCount} of ${MAX_RETRIES})`);
          
          // Don't reset loading state for retries
          setTimeout(() => {
            const state = get();
            state.performInitialization(loginOnly);
          }, RETRY_DELAY);
        } else {
          console.error('❌ [Auth] Max retry attempts reached, resetting state');
          set({ 
            isLoading: false,
            initialized: true,
            initializationAttempted: true,
            error: 'Authentication timed out after multiple attempts'
          });
          initRetryCount = 0; // Reset for next time
        }
      }
    }, INIT_TIMEOUT); // 30 second timeout
    
    // Enhanced initialization guard with safety reset
    if (state.initialized && !loginOnly && state.user) {
      console.log('🔄 [Auth] Initialization already completed with user, skipping...');
      clearTimeout(initTimeout);
      return;
    }

    // Prevent concurrent initialization but with timeout protection
    if (state.isLoading && !loginOnly) {
      console.log('🔄 [Auth] Initialization already in progress, checking duration...');
      // If already loading for more than 10 seconds, reset the state
      const loadingStart = state.loadingStartTime || 0;
      const loadingDuration = Date.now() - loadingStart;
      
      if (loadingDuration > 10000) {
        console.warn(`⚠️ [Auth] Loading state stuck for ${loadingDuration/1000}s, resetting...`);
        set({ isLoading: false });
      } else {
        clearTimeout(initTimeout);
        return;
      }
    }
    
    // Session recovery attempt with more robust error handling
    if (!loginOnly && !state.session) {
      console.log('🔄 [Auth] Attempting session recovery...');
      try {
        const { data: { session: recoveredSession } } = await supabase.auth.getSession();
        if (recoveredSession) {
          console.log('✅ [Auth] Session recovered successfully');
          set({ session: recoveredSession });
          // Setup session timeout monitor for the recovered session
          setupSessionTimeout(recoveredSession);
        }
      } catch (error) {
        console.warn('⚠️ [Auth] Session recovery failed:', error);
      }
    }

    // Track when loading started to detect stuck states
    set({ isLoading: true, initializationAttempted: true, loadingStartTime: Date.now() });
    console.log('🔄 [Auth] Starting initialization...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [Auth] Session error:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log('🔐 [Auth] Found session for user:', { userId: session.user.id, email: session.user.email });
        
        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role, region_id, sector_id, school_id)
          `)
          .eq('id', session.user.id)
          .single();

        // Ətraflı profil məlumatlarını log edirik
        console.log('👤 [Auth] Profile data for initialization:', profile);

        if (profileError) {
          console.error('❌ [Auth] Error fetching profile during initialization:', profileError);
          throw profileError;
        }

        if (profile) {
          // user_roles məlumatlarını normalize edirik (initialization)
          console.log('🔍 [Auth] User roles raw data during initialization:', profile?.user_roles);
          
          // Rol təyinatını dəqiqləşdiririk - robust role detection
          let userRole: UserRole = 'user' as UserRole; // default
          let regionId, sectorId, schoolId;
          
          const isKnownSuperAdmin = session.user.email?.toLowerCase() === 'superadmin@infoline.az';
          
          if (isKnownSuperAdmin) {
            userRole = 'superadmin' as UserRole;
          } else if (profile?.user_roles) {
            // Normalize user_roles - həm array həm də object case-lərini handle edirik
            const roleData = Array.isArray(profile.user_roles) 
              ? profile.user_roles[0] 
              : profile.user_roles;
              
            if (roleData?.role) {
              userRole = roleData.role as UserRole;
              regionId = roleData.region_id;
              sectorId = roleData.sector_id;
              schoolId = roleData.school_id;
            }
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

          // Role data artıq yuxarıda extract edilib (initialization)

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
        console.log('🔓 [Auth] No active session found');
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

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) {
      console.log('🔒 [Auth] No user found for permission check');
      return false;
    }
    
    // Robust permission check
    console.log('🔒 [Auth] Checking permission', { 
      permission,
      userRole: user.role,
      email: user.email
    });
    
    // SuperAdmin checks
    if (user.role === 'superadmin') return true;
    if (user.email?.toLowerCase() === 'superadmin@infoline.az') return true;
    
    // Basic role-based permissions
    switch (permission) {
      case 'read':
        return ['regionadmin', 'sectoradmin', 'schooladmin', 'teacher', 'user'].includes(user.role);
      case 'write':
        return ['regionadmin', 'sectoradmin', 'schooladmin'].includes(user.role);
      case 'admin':
        return ['regionadmin', 'sectoradmin'].includes(user.role);
      default:
        return false;
    }
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
