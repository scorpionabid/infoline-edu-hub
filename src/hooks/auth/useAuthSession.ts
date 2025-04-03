
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserData } from '@/hooks/auth/userDataService';

/**
 * Auth session idarəetməsi üçün hook
 */
export const useAuthSession = (setState: any) => {
  // Sessiya dinlə və ilkin sessiyanı al
  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Set timeout to prevent hanging
    const authTimeout = setTimeout(() => {
      if (setState(prev => prev.loading)) {
        console.warn('Auth yüklənməsi timeout-a uğradı - 10 saniyə keçdi');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 10000);
    
    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state dəyişdi:', event, !!session);
        setState(prev => ({ ...prev, session }));
        
        // TOKEN_REFRESHED və SIGNED_IN hadisələrini düzgün işləyirik
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // setTimeout istifadəsi ilə dairəvi asılılıq problemini həll edirik
            setTimeout(async () => {
              try {
                const userData = await getUserData(session.user.id);
                setState(prev => ({ 
                  ...prev, 
                  user: userData, 
                  loading: false,
                  session
                }));
                console.log('Auth state yeniləndi:', event, !!userData);
              } catch (error) {
                console.error('İstifadəçi məlumatları alınarkən xəta:', error);
                setState(prev => ({ 
                  ...prev, 
                  loading: false,
                  error: error as Error 
                }));
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('İstifadəçi çıxış etdi');
          setState({ 
            user: null, 
            loading: false, 
            error: null, 
            session: null 
          });
        }
      }
    );
    
    // İlkin sessiya alınması
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setState(prev => ({ ...prev, session }));
        
        if (session?.user) {
          try {
            const userData = await getUserData(session.user.id);
            setState(prev => ({ 
              ...prev, 
              user: userData, 
              loading: false 
            }));
            console.log('İlkin sessiya məlumatları alındı:', !!userData);
          } catch (userError) {
            setState(prev => ({ 
              ...prev, 
              user: null, 
              loading: false,
              error: userError as Error 
            }));
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error as Error, 
          loading: false 
        }));
      }
    };
    
    initializeAuth();
    
    // Təmizləmə
    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, [setState]);
};
