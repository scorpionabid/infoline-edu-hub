
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  Bell, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

interface ChannelStats {
  email: number;
  push: number;
  inApp: number;
  sms: number;
}

export const NotificationAnalytics: React.FC = () => {
  const { notifications } = useNotifications();
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    pending: 0
  });

  const [channelStats, setChannelStats] = useState<ChannelStats>({
    email: 0,
    push: 0,
    inApp: 0,
    sms: 0
  });

  useEffect(() => {
    // Calculate stats from notifications
    const newStats = notifications.reduce((acc, notification) => {
      acc.total += 1;
      
      switch (notification.status) {
        case 'sent':
          acc.sent += 1;
          break;
        case 'delivered':
          acc.delivered += 1;
          break;
        case 'read':
          acc.read += 1;
          break;
        case 'failed':
          acc.failed += 1;
          break;
        default:
          acc.pending += 1;
      }
      
      return acc;
    }, {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      pending: 0
    });

    setStats(newStats);

    // Calculate channel stats
    const channels = notifications.reduce((acc, notification) => {
      const channel = notification.channel || 'inApp';
      acc[channel as keyof ChannelStats] = (acc[channel as keyof ChannelStats] || 0) + 1;
      return acc;
    }, {
      email: 0,
      push: 0,
      inApp: 0,
      sms: 0
    });

    setChannelStats(channels);
  }, [notifications]);

  const deliveryRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;
  const readRate = stats.delivered > 0 ? Math.round((stats.read / stats.delivered) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Analytics</h2>
          <p className="text-muted-foreground">
            Bildirim performansı və istifadəçi engagement metrikləri
          </p>
        </div>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay göndərilən ümumi bildirim sayı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate}%</div>
            <Progress value={deliveryRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readRate}%</div>
            <Progress value={readRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Uğursuz olan bildirimlər
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                  <Badge variant="secondary">{stats.delivered}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Read</span>
                  </div>
                  <Badge variant="secondary">{stats.read}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <Badge variant="secondary">{stats.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Failed</span>
                  </div>
                  <Badge variant="destructive">{stats.failed}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delivery Success Rate</span>
                    <span>{deliveryRate}%</span>
                  </div>
                  <Progress value={deliveryRate} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Read Rate</span>
                    <span>{readRate}%</span>
                  </div>
                  <Progress value={readRate} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.failed / stats.total) * 100 : 0} 
                    className="[&>div]:bg-red-500" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bildirimlərin kanal üzrə bölgüsü
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>In-App</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{channelStats.inApp}</span>
                    <Progress 
                      value={stats.total > 0 ? (channelStats.inApp / stats.total) * 100 : 0} 
                      className="w-20" 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-green-500" />
                    <span>Push</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{channelStats.push}</span>
                    <Progress 
                      value={stats.total > 0 ? (channelStats.push / stats.total) * 100 : 0} 
                      className="w-20" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Engagement metrikləri yüklənir...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAnalytics;
