import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * A component for testing authentication functionality.
 * Only available in development mode.
 */
const AuthTester: React.FC = () => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({});

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleLogin = async () => {
    setLoading(true);
    setResult({});
    try {
      await auth.login(email, password);
      setResult({ success: true, message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setResult({});
    try {
      await auth.logout();
      setResult({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setResult({});
    try {
      // Force a refresh of the auth state
      const session = await auth.getSession();
      setResult({ 
        success: true, 
        message: `Session refresh: ${session ? 'Session found' : 'No session'}`
      });
    } catch (error) {
      console.error('Refresh error:', error);
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshSession = async () => {
    setLoading(true);
    setResult({});
    try {
      // Sessiyanı yenilə
      if (auth.refreshSession) {
        console.log('AuthTester: refreshSession çağırılır...');
        const session = await auth.refreshSession();
        console.log('AuthTester: refreshSession nəticəsi:', session);
        
        setResult({ 
          success: true, 
          message: `Session refreshed: ${session ? `Success (${session.user?.id})` : 'Failed'}`
        });
      } else {
        setResult({ 
          success: false, 
          message: 'refreshSession function not available'
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Authentication Tester</CardTitle>
        <CardDescription>Test authentication functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="status">Auth Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2 flex-wrap gap-2">
              <Button onClick={handleLogin} disabled={loading || !email || !password}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={handleLogout} variant="outline" disabled={loading}>
                Logout
              </Button>
              <Button onClick={handleRefresh} variant="secondary" disabled={loading}>
                Get Session
              </Button>
              <Button onClick={handleRefreshSession} variant="secondary" disabled={loading}>
                Refresh Session
              </Button>
            </div>
            
            {result.message && (
              <div className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {result.message}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="status" className="mt-4">
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className="font-medium">isAuthenticated:</div>
                <div className={auth.isAuthenticated ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {auth.isAuthenticated ? 'true' : 'false'}
                </div>
                
                <div className="font-medium">isLoading:</div>
                <div className={auth.isLoading ? 'text-blue-600' : 'text-gray-600'}>
                  {auth.isLoading ? 'true' : 'false'}
                </div>
                
                <div className="font-medium">error:</div>
                <div className={auth.error ? 'text-red-600' : 'text-gray-600'}>
                  {auth.error || 'null'}
                </div>
                
                <div className="font-medium">session:</div>
                <div className={auth.session ? 'text-green-600' : 'text-red-600'}>
                  {auth.session ? '✓' : '✗'}
                  {auth.session && ` (${auth.session.user?.id?.slice(0, 8)}...)`}
                </div>
                
                <div className="font-medium">user:</div>
                <div className={auth.user ? 'text-green-600' : 'text-red-600'}>
                  {auth.user ? '✓' : '✗'}
                  {auth.user && ` (${auth.user.email})`}
                </div>
                
                <div className="font-medium">role:</div>
                <div className="text-purple-600 font-medium">
                  {auth.user?.role || 'none'}
                </div>
              </div>
              
              {auth.session && (
                <div className="mt-4 pt-2 border-t">
                  <div className="font-medium mb-1">Session Details:</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify({
                      user_id: auth.session.user?.id,
                      email: auth.session.user?.email,
                      expires_at: auth.session.expires_at,
                      last_sign_in_at: auth.session.user?.last_sign_in_at
                    }, null, 2)}
                  </pre>
                </div>
              )}
              
              {auth.user && (
                <div className="mt-4 pt-2 border-t">
                  <div className="font-medium mb-1">User Details:</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(auth.user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        This component is only visible in development mode
      </CardFooter>
    </Card>
  );
};

export default AuthTester;
