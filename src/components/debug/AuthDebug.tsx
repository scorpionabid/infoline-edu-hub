import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, session } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Auth user check
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        // Session check
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        // Test direct query
        const { data: sectorsData, error: sectorsError } = await supabase
          .from('sectors')
          .select('*')
          .limit(1);
          
        // Test regions query
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('*')
          .limit(1);

        setDebugInfo({
          authUser,
          authError,
          currentSession,
          sessionError,
          sectorsData,
          sectorsError,
          regionsData,
          regionsError,
          storeUser: user,
          storeAuth: isAuthenticated,
          storeSession: session
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [user, isAuthenticated, session]);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      width: '400px', 
      height: '100vh', 
      overflow: 'auto',
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      <h3>🔍 Auth Debug Panel</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default AuthDebug;