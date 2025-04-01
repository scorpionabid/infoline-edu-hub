import React from 'react';
import AuthTester from '@/components/debug/AuthTester';
import AuthDebugger from '@/components/debug/AuthDebugger';

/**
 * Debug page containing various debugging tools.
 * Only accessible in development mode.
 */
const Debug: React.FC = () => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Debug Page</h1>
          <p>Debug tools are only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Testing</h2>
        <AuthTester />
      </div>
      
      {/* Always show the AuthDebugger on this page */}
      <AuthDebugger visible={true} />
    </div>
  );
};

export default Debug;
