
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AuthDebugger: React.FC = () => {
  const auth = useAuth();
  const [sessionData, setSessionData] = React.useState<any>(null);
  
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSessionData(data.session);
  };
  
  React.useEffect(() => {
    getSession();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
        <CardDescription>Debug information about current authentication state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Current User</h3>
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-64 text-xs">
            {JSON.stringify(auth.user, null, 2)}
          </pre>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Current Session</h3>
          <pre className="p-4 bg-muted rounded-md overflow-auto max-h-64 text-xs">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => auth.logout()} variant="destructive" size="sm">
            Logout
          </Button>
          <Button onClick={getSession} variant="outline" size="sm">
            Refresh Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
