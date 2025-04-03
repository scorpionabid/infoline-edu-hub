import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import AuthDebugger from '@/components/debug/AuthDebugger';
import AuthTester from '@/components/debug/AuthTester';

const Debug = () => {
  const { user, loading, error, session } = useAuth();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Debug Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Tester</CardTitle>
            <CardDescription>Test authentication operations</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthTester />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Auth State</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthDebugger visible={true} />
          </CardContent>
        </Card>
        
        {/* Additional debug cards can be added here */}
      </div>
    </div>
  );
};

export default Debug;
