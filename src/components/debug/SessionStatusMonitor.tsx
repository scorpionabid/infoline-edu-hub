// ============================================================================
// İnfoLine Debug Components - Session Status Monitor
// ============================================================================
// Bu komponent session status-unu real-time göstərmək üçündür (development only)

import React, { useState } from 'react';
import { useSessionMonitor, useSessionExpiry } from '@/hooks/auth/useSessionMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  Timer
} from 'lucide-react';

/**
 * Session Status Monitor Component (Development Only)
 * Göstərir session-ın real-time status-unu
 */
export const SessionStatusMonitor: React.FC<{ 
  enabled?: boolean;
  compact?: boolean;
}> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const { status, forceRefresh, getDetailedInfo, isHealthy, warnings } = useSessionMonitor({
    enabled,
    checkInterval: 5000, // Update every 5 seconds for demo
  });
  
  const { showWarning, minutesLeft } = useSessionExpiry(10); // Show warning at 10 minutes
  
  // Don't render in production unless explicitly enabled
  if (!enabled) return null;
  
  const getStatusColor = () => {
    if (!isHealthy) return 'destructive';
    if (showWarning) return 'secondary';
    return 'default';
  };
  
  const getStatusIcon = () => {
    if (!isHealthy) return <AlertTriangle className="h-4 w-4" />;
    if (showWarning) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };
  
  const handleForceRefresh = async () => {
    const success = await forceRefresh();
    if (success) {
      // Show success feedback
      console.log('✅ Force refresh successful');
    }
  };
  
  const formatTimeUntilExpiry = (ms: number | null) => {
    if (!ms) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (compact && !isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 ${
            !isHealthy ? 'border-red-500 text-red-600' : 
            showWarning ? 'border-yellow-500 text-yellow-600' : ''
          }`}
        >
          {getStatusIcon()}
          Session
          {!isHealthy && (
            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
              {warnings.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Session Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()} className="flex items-center gap-1">
                {getStatusIcon()}
                {isHealthy ? 'Healthy' : 'Issues'}
              </Badge>
              {compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Session Expiry */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="text-sm">Expires in:</span>
            </div>
            <Badge variant={showWarning ? 'secondary' : 'outline'}>
              {formatTimeUntilExpiry(status.timeUntilExpiry)}
            </Badge>
          </div>
          
          {/* Refresh Timer Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Auto Refresh:</span>
            </div>
            <Badge variant={status.hasActiveTimer ? 'default' : 'secondary'}>
              {status.hasActiveTimer ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {/* Retry Count */}
          {status.retryCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Retries:</span>
              </div>
              <Badge variant="secondary">
                {status.retryCount}
              </Badge>
            </div>
          )}
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <div key={index} className="text-xs">
                      • {warning}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Force Refresh Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRefresh}
              className="w-full"
              disabled={status.retryCount > 0}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Force Refresh
            </Button>
          </div>
          
          {/* Debug Info Button */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const info = getDetailedInfo();
                console.log('🔍 [Session Debug] Detailed Info:', info);
              }}
              className="w-full text-xs"
            >
              Log Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Session Expiry Warning Component
 * Göstərir session expiry warning modal/toast
 */
export const SessionExpiryWarning: React.FC<{
  enabled?: boolean;
  warningMinutes?: number;
}> = ({ 
  enabled = true,
  warningMinutes = 5 
}) => {
  const { showWarning, minutesLeft, needsRefresh } = useSessionExpiry(warningMinutes);
  const { forceRefresh } = useSessionMonitor({ enabled: false }); // Don't start monitoring
  
  if (!enabled || !showWarning) return null;
  
  const handleExtendSession = async () => {
    await forceRefresh();
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Alert className="border-yellow-500 bg-yellow-50">
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Session Expiring Soon</p>
            <p className="text-sm">
              Your session will expire in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleExtendSession}
                className="flex-1"
              >
                Extend Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Handle logout or dismiss
                  console.log('Session warning dismissed');
                }}
                className="flex-1"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

/**
 * Comprehensive Session Debug Panel
 * Development only - full debug information
 */
export const SessionDebugPanel: React.FC<{
  enabled?: boolean;
}> = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const { status, getDetailedInfo } = useSessionMonitor({ enabled });
  const [isOpen, setIsOpen] = useState(false);
  
  if (!enabled) return null;
  
  const debugInfo = getDetailedInfo();
  
  return (
    <>
      {/* Debug Toggle Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Debug
        </Button>
      </div>
      
      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-96 max-h-96 overflow-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Session Debug Info
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <div><strong>Auth State:</strong></div>
                <div className="pl-2">
                  • Authenticated: {debugInfo.authState.isAuthenticated ? '✅' : '❌'}<br/>
                  • Loading: {debugInfo.authState.isLoading ? '🔄' : '✅'}<br/>
                  • Initialized: {debugInfo.authState.initialized ? '✅' : '❌'}<br/>
                  • Error: {debugInfo.authState.error || 'None'}
                </div>
                
                <div><strong>Session:</strong></div>
                <div className="pl-2">
                  • Has Session: {debugInfo.session ? '✅' : '❌'}<br/>
                  {debugInfo.session && (
                    <>
                      • Expires: {debugInfo.session.expiresAt.toLocaleString()}<br/>
                      • User ID: {debugInfo.session.userId}
                    </>
                  )}
                </div>
                
                <div><strong>Manager:</strong></div>
                <div className="pl-2">
                  • Refresh Timer: {debugInfo.manager.hasRefreshTimer ? '✅' : '❌'}<br/>
                  • Background Checker: {debugInfo.manager.hasBackgroundChecker ? '✅' : '❌'}<br/>
                  • Retry Count: {debugInfo.manager.retryCount}<br/>
                  • Last Activity: {debugInfo.manager.lastActivity.toLocaleTimeString()}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('🔍 Full Debug Info:', debugInfo)}
                className="w-full text-xs"
              >
                Log Full Info
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SessionStatusMonitor;
