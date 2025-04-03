
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * A component that provides controls to test authentication functionality.
 * Only visible in development mode.
 */
const AuthTester: React.FC = () => {
  const auth = useAuth();
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Tester</CardTitle>
        <CardDescription>Use these controls to test authentication functionality</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={() => console.log('Auth state:', auth)} variant="outline" size="sm">
          Log Auth State
        </Button>
        
        {!auth.isAuthenticated ? (
          <Button 
            onClick={() => auth.login('test@example.com', 'password')} 
            variant="secondary" 
            size="sm"
          >
            Mock Login
          </Button>
        ) : (
          <Button 
            onClick={() => auth.logout()} 
            variant="secondary" 
            size="sm"
          >
            Logout
          </Button>
        )}
        
        {auth.isAuthenticated && (
          <Button 
            onClick={() => auth.updateProfile({
              full_name: `User ${Math.floor(Math.random() * 100)}`
            })}
            variant="outline"
            size="sm"
          >
            Update Name
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthTester;
