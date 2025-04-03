
import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface AuthDebuggerProps {
  visible: boolean;
}

const AuthDebugger: React.FC<AuthDebuggerProps> = ({ visible }) => {
  const { user, loading, error, session, isAuthenticated } = useAuth();

  if (!visible || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-4 max-w-sm opacity-75 hover:opacity-100 transition-opacity z-50 overflow-auto max-h-96 text-xs">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div className="mb-2">
        <span className="font-bold">Status: </span>
        {loading && 'Loading...'}
        {!loading && isAuthenticated && 'Authenticated'}
        {!loading && !isAuthenticated && 'Not Authenticated'}
      </div>

      {error && (
        <div className="mb-2 text-red-400">
          <span className="font-bold">Error: </span>
          {error.message}
        </div>
      )}

      {user && (
        <div className="mb-2">
          <span className="font-bold">User: </span>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {session && (
        <div className="mb-2">
          <span className="font-bold">Session: </span>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
