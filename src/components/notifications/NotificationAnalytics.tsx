import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useNotificationAnalytics } from '@/hooks/notifications/useEnhancedNotifications';

interface NotificationAnalyticsProps {
  className?: string;
}

export const NotificationAnalytics: React.FC<NotificationAnalyticsProps> = ({
  className
}) => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('30'); // days
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { analytics, loading, fetchAnalytics } = useNotificationAnalytics();

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchAnalytics();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    // You could implement period-specific analytics here
    await fetchAnalytics();
  };

  // Default analytics if not loaded
  const defaultAnalytics = {
    total: 0,
    unread: 0,
    readRate: 0,
    byType: {},
    byPriority: {},
    emailDeliveryRate: 0
  };

  const data = analytics || defaultAnalytics;

  // Calculate derived metrics
  const readPercentage = data.total > 0 ? ((data.total - data.unread) / data.total) * 100 : 0;
  const criticalCount = data.byPriority?.critical || 0;
  const highCount = data.byPriority?.high || 0;
  const urgentTotal = criticalCount + highCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="font-semibold">{t('notificationAnalytics')}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 gün</SelectItem>
              <SelectItem value="30">Son 30 gün</SelectItem>
              <SelectItem value="90">Son 3 ay</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={cn(
              "h-3 w-3", 
              (loading || isRefreshing) && "animate-spin"
            )} />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-72 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Ümumi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold">{data.total}</div>
                  <p className="text-xs text-muted-foreground">bildiriş</p>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-orange-600" />
                    Oxunmamış
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-orange-600">{data.unread}</div>
                  <p className="text-xs text-muted-foreground">bildiriş</p>
                </CardContent>
              </Card>
            </div>

            {/* Read Rate */}
            <Card className="p-3">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Oxunma Faizi
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {readPercentage.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Progress value={readPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Oxunmuş: {data.total - data.unread}</span>
                  <span>Oxunmamış: {data.unread}</span>
                </div>
              </CardContent>
            </Card>

            {/* Type Breakdown */}
            {Object.keys(data.byType || {}).length > 0 && (
              <Card className="p-3">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm">Növə görə</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  {Object.entries(data.byType).map(([type, count]) => {
                    const percentage = data.total > 0 ? ((count as number) / data.total) * 100 : 0;
                    
                    const typeColors = {
                      success: 'bg-green-500',
                      warning: 'bg-yellow-500',
                      error: 'bg-red-500',
                      info: 'bg-blue-500',
                      deadline: 'bg-purple-500'
                    };
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            typeColors[type as keyof typeof typeColors] || 'bg-gray-500'
                          )} />
                          <span className="text-sm capitalize">{type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count as number}</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Priority Breakdown */}
            {Object.keys(data.byPriority || {}).length > 0 && (
              <Card className="p-3">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Prioritetə görə</span>
                    {urgentTotal > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {urgentTotal} təcili
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  {Object.entries(data.byPriority).map(([priority, count]) => {
                    const percentage = data.total > 0 ? ((count as number) / data.total) * 100 : 0;
                    
                    const priorityColors = {
                      critical: 'bg-red-600',
                      high: 'bg-orange-500',
                      normal: 'bg-blue-500',
                      low: 'bg-gray-400'
                    };
                    
                    const priorityLabels = {
                      critical: 'Kritik',
                      high: 'Yüksək',
                      normal: 'Normal',
                      low: 'Aşağı'
                    };
                    
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500'
                          )} />
                          <span className="text-sm">
                            {priorityLabels[priority as keyof typeof priorityLabels] || priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count as number}</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Email Delivery Rate */}
            {data.emailDeliveryRate !== undefined && (
              <Card className="p-3">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Email Çatdırılma</span>
                    <Badge 
                      variant={data.emailDeliveryRate > 90 ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {data.emailDeliveryRate.toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Progress value={data.emailDeliveryRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email bildirişlərinin çatdırılma faizi
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {data.total === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Seçilmiş dövr üçün analitik məlumat yoxdur
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationAnalytics;
