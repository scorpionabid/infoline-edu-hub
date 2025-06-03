
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export const NotificationAnalytics: React.FC = () => {
  // Mock analytics data
  const analytics = {
    totalNotifications: 156,
    readRate: 78,
    avgResponseTime: '2.3h',
    criticalNotifications: 12,
    trends: {
      thisWeek: 23,
      lastWeek: 18,
      growth: 27.8
    },
    byType: [
      { type: 'info', count: 89, percentage: 57 },
      { type: 'warning', count: 34, percentage: 22 },
      { type: 'error', count: 21, percentage: 13 },
      { type: 'success', count: 12, percentage: 8 }
    ]
  };

  return (
    <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ümumi bildirişlər</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analytics.totalNotifications}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{analytics.trends.growth}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Oxunma nisbəti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analytics.readRate}%</div>
            <Progress value={analytics.readRate} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Növlərə görə bölgü</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analytics.byType.map((item) => (
            <div key={item.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {item.type === 'error' ? (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                ) : item.type === 'success' ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                )}
                <span className="capitalize">{item.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{item.count}</span>
                <div className="w-12 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-red-600">{analytics.criticalNotifications}</div>
          <div className="text-xs text-gray-600">Kritik bildirişlər</div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold">{analytics.avgResponseTime}</div>
          <div className="text-xs text-gray-600">Orta cavab vaxtı</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationAnalytics;
