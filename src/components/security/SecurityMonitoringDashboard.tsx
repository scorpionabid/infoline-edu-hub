
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye,
  TrendingUp 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  action: string;
  user_id: string;
  created_at: string;
  details?: any;
}

interface SecurityStats {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeUsers: number;
}

const SecurityMonitoringDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action', ['LOGIN_ATTEMPT', 'LOGIN_FAILED', 'LOGIN_SUCCESS', 'LOGOUT'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      setSecurityEvents(events || []);

      // Calculate security stats
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEvents = events?.filter(event => 
        new Date(event.created_at) > last24Hours
      ) || [];

      const stats: SecurityStats = {
        totalEvents: recentEvents.length,
        failedLogins: recentEvents.filter(e => e.action === 'LOGIN_FAILED').length,
        suspiciousActivity: recentEvents.filter(e => 
          e.action.includes('SUSPICIOUS') || 
          e.details?.suspicious === true
        ).length,
        activeUsers: new Set(
          recentEvents
            .filter(e => e.action === 'LOGIN_SUCCESS')
            .map(e => e.user_id)
        ).size
      };

      setSecurityStats(stats);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadgeVariant = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'default';
      case 'LOGIN_FAILED': return 'destructive';
      case 'LOGOUT': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return Lock;
      case 'LOGIN_FAILED': return AlertTriangle;
      case 'LOGOUT': return Eye;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityStats.failedLogins}
            </div>
            <p className="text-xs text-muted-foreground">Security incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Shield className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {securityStats.suspiciousActivity}
            </div>
            <p className="text-xs text-muted-foreground">Flagged events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {securityStats.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityStats.failedLogins > 5 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High number of failed login attempts detected!</strong>
            <br />
            {securityStats.failedLogins} failed attempts in the last 24 hours. 
            Consider implementing additional security measures.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent security events
              </p>
            ) : (
              securityEvents.map((event) => {
                const IconComponent = getEventIcon(event.action);
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{event.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getEventBadgeVariant(event.action)}>
                      {event.action.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoringDashboard;
