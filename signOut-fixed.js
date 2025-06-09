  signOut: async () => {
    console.log('[AuthStore] Starting sign out...');
    
    try {
      // CRITICAL FIX: State-i ĐLK öncə təmizlə ki, ProtectedRoute dərhal cavab versin
      console.log('[AuthStore] Clearing local state FIRST...');
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null,
        isLoading: false,
        // Re-initialization üçün flag-ları sıfırla
        initialized: false,
        initializationAttempted: false
      });
      
      // CRITICAL FIX: Cache və localStorage-ı dərhal təmizlə
      try {
        // Supabase auth key-ləri təmizlə
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('supabase') || 
            key.startsWith('app-cache-') || 
            key.startsWith('infoline-') ||
            key.includes('auth')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Session storage da təmizlə
        sessionStorage.clear();
        
        console.log('[AuthStore] Storage cleared successfully');
      } catch (e) {
        console.warn('[AuthStore] Error clearing storage (non-critical):', e);
      }
      
      // CRITICAL FIX: İndi Supabase signOut-u çağır (background-da)
      console.log('[AuthStore] Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('[AuthStore] Supabase signOut error (non-critical since state already cleared):', error);
        // State artıq təmizlənib, Supabase xətası kritik deyil
      }
      
      console.log('[AuthStore] Sign out completed successfully');
      
      // CRITICAL FIX: Dərhal redirect et
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        console.log('[AuthStore] Redirecting to login...');
        window.location.replace('/login');
      }
      
    } catch (error: any) {
      console.error('[AuthStore] Sign out error:', error);
      
      // CRITICAL FIX: Xəta halında da state təmizlənsin (əgər hələ təmizlənməyibsə)
      set({ 
        user: null, 
        isAuthenticated: false, 
        session: null,
        error: null,
        isLoading: false,
        initialized: false,
        initializationAttempted: false
      });
      
      // CRITICAL FIX: Xəta halında da login səhifəsinə yönləndir
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      
      throw error; // Xətanı rethrow et ki, UI-da handle edilsin
    }
  },