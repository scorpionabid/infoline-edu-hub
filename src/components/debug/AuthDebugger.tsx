
import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface AuthDebuggerProps {
  visible?: boolean;
}

/**
 * A component that displays the current authentication state for debugging purposes.
 * Only visible in development mode and when the visible prop is true.
 */
const AuthDebugger: React.FC<AuthDebuggerProps> = ({ visible = false }) => {
  const auth = useAuth();
  
  // Only show in development mode and when explicitly enabled
  if (process.env.NODE_ENV !== 'development' || !visible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg shadow-lg max-w-md z-50 text-xs font-mono">
      <h3 className="font-bold mb-2">Auth Debugger</h3>
      <div className="space-y-1">
        <div><span className="text-blue-400">isAuthenticated:</span> {auth.isAuthenticated ? 'true' : 'false'}</div>
        <div><span className="text-blue-400">isLoading:</span> {auth.isLoading ? 'true' : 'false'}</div>
        <div><span className="text-blue-400">error:</span> {auth.error ? auth.error.toString() : 'null'}</div>
        <div><span className="text-blue-400">session:</span> {auth.session ? '✓' : '✗'}</div>
        <div><span className="text-blue-400">user:</span> {auth.user ? '✓' : '✗'}</div>
        {auth.user && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div><span className="text-green-400">id:</span> {auth.user.id}</div>
            <div><span className="text-green-400">email:</span> {auth.user.email}</div>
            <div><span className="text-green-400">role:</span> {auth.user.role}</div>
            <div><span className="text-green-400">name:</span> {auth.user.full_name}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger;
