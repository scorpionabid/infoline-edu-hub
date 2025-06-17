import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

const AuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    const updateDebugInfo = () => {
      const state = useAuthStore.getState();
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
          role: state.user.role,
          full_name: state.user.full_name
        } : null,
        session: state.session ? 'exists' : null,
        error: state.error,
        initialized: state.initialized,
        initializationAttempted: state.initializationAttempted
      });
    };

    // Update immediately
    updateDebugInfo();
    
    // Update every second during login process
    const interval = setInterval(updateDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default AuthDebugger;