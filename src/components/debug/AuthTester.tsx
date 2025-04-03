
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const AuthTester: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, session, error, login, logout, resetPassword, refreshSession, getSession } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSessionExpanded, setIsSessionExpanded] = useState(false);
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  const handleLogin = async () => {
    setTestResult(null);
    try {
      await login(email, password);
      setTestResult({
        success: true,
        message: 'Login successful'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Login failed: ${err.message || 'Unknown error'}`
      });
    }
  };
  
  const handleLogout = async () => {
    setTestResult(null);
    try {
      await logout();
      setTestResult({
        success: true,
        message: 'Logout successful'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Logout failed: ${err.message || 'Unknown error'}`
      });
    }
  };
  
  const handleResetPassword = async () => {
    setTestResult(null);
    try {
      await resetPassword(resetEmail);
      setTestResult({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Password reset failed: ${err.message || 'Unknown error'}`
      });
    }
  };
  
  const handleRefreshSession = async () => {
    setTestResult(null);
    try {
      const refreshedSession = await refreshSession();
      setTestResult({
        success: !!refreshedSession,
        message: refreshedSession 
          ? 'Session refreshed successfully' 
          : 'Session refresh returned null'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Session refresh failed: ${err.message || 'Unknown error'}`
      });
    }
  };
  
  const handleGetSession = async () => {
    setTestResult(null);
    try {
      const currentSession = await getSession();
      setTestResult({
        success: !!currentSession,
        message: currentSession 
          ? 'Session retrieved successfully' 
          : 'No active session found'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Get session failed: ${err.message || 'Unknown error'}`
      });
    }
  };
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Auth Testing Tool
          <Badge variant={isAuthenticated ? "success" : "destructive"} className="ml-2">
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
        <CardDescription>Test authentication functions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="logout">Logout</TabsTrigger>
            <TabsTrigger value="reset">Reset Password</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
              />
            </div>
            <Button onClick={handleLogin} disabled={isLoading}>Login</Button>
          </TabsContent>
          
          <TabsContent value="logout" className="mt-4">
            <Button onClick={handleLogout} disabled={isLoading || !isAuthenticated}>Logout</Button>
          </TabsContent>
          
          <TabsContent value="reset" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input 
                id="reset-email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="Enter your email"
              />
            </div>
            <Button onClick={handleResetPassword} disabled={isLoading}>Send Reset Email</Button>
          </TabsContent>
          
          <TabsContent value="session" className="space-y-4 mt-4">
            <div className="flex space-x-2">
              <Button onClick={handleRefreshSession} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Session
              </Button>
              <Button onClick={handleGetSession} disabled={isLoading} variant="outline">
                Get Current Session
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.toString()}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start">
        <div className="w-full">
          <Collapsible
            open={isSessionExpanded}
            onOpenChange={setIsSessionExpanded}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2">
                <span>Session Info</span>
                {isSessionExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2">
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded-md text-xs">
                {session ? JSON.stringify(session, null, 2) : 'No session'}
              </pre>
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible
            open={isUserExpanded}
            onOpenChange={setIsUserExpanded}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2">
                <span>User Info</span>
                {isUserExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2">
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded-md text-xs">
                {user ? JSON.stringify(user, null, 2) : 'No user'}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthTester;
