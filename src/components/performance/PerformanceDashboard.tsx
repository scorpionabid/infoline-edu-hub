import React, { useState, useEffect, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  MemoryStick,
  Wifi,
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceOptimization';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  cacheHitRate: number;
  activeConnections: number;
}

interface PerformanceIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  component?: string;
}

const PerformanceDashboard = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 45,
    networkLatency: 120,
    renderTime: 16,
    cacheHitRate: 85,
    activeConnections: 3
  });

  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  usePerformanceMonitor('PerformanceDashboard');

  const addIssue = useCallback((type: 'warning' | 'error' | 'info', message: string, component?: string) => {
    const newIssue: PerformanceIssue = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      component
    };

    setIssues(prev => [newIssue, ...prev].slice(0, 10)); // Keep only last 10 issues
  }, []);

  // Real-time performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate real performance metrics
      const newMetrics: PerformanceMetrics = {
        fps: Math.max(30, 60 - Math.random() * 10),
        memoryUsage: Math.min(100, 40 + Math.random() * 20),
        networkLatency: 100 + Math.random() * 50,
        renderTime: 12 + Math.random() * 8,
        cacheHitRate: 80 + Math.random() * 15,
        activeConnections: Math.floor(2 + Math.random() * 4)
      };

      setMetrics(newMetrics);

      // Generate performance issues
      if (newMetrics.fps < 45) {
        addIssue('warning', 'Aşağı FPS aşkarlandı', 'RenderEngine');
      }
      if (newMetrics.memoryUsage > 80) {
        addIssue('error', 'Yüksək yaddaş istifadəsi', 'MemoryManager');
      }
      if (newMetrics.networkLatency > 200) {
        addIssue('warning', 'Şəbəkə gecikmələri', 'NetworkManager');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, addIssue]);

  const getMetricColor = (value: number, thresholds: { warning: number; error: number }, reverse = false) => {
    if (reverse) {
      if (value < thresholds.error) return 'text-red-600';
      if (value < thresholds.warning) return 'text-yellow-600';
      return 'text-green-600';
    } else {
      if (value > thresholds.error) return 'text-red-600';
      if (value > thresholds.warning) return 'text-yellow-600';
      return 'text-green-600';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performans İzləmə</h1>
          <p className="text-muted-foreground">Sistem performansını real vaxtda izləyin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                İzləmə Aktiv
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                İzləməni Başlat
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FPS</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.fps, { warning: 50, error: 40 }, true)}`}>
              {metrics.fps.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Render performansı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaddaş</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.memoryUsage, { warning: 70, error: 85 })}`}>
              {metrics.memoryUsage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Yaddaş istifadəsi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şəbəkə</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.networkLatency, { warning: 150, error: 200 })}`}>
              {metrics.networkLatency.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Şəbəkə gecikmələri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Vaxtı</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.renderTime, { warning: 20, error: 30 })}`}>
              {metrics.renderTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">Ortalama render vaxtı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.cacheHitRate, { warning: 70, error: 60 }, true)}`}>
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Cache effektivliyi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bağlantılar</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.activeConnections}
            </div>
            <p className="text-xs text-muted-foreground">Aktiv bağlantılar</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Problemlər</TabsTrigger>
          <TabsTrigger value="components">Komponentlər</TabsTrigger>
          <TabsTrigger value="optimization">Optimallaşdırma</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Performans Problemləri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Hazırda performans problemi aşkarlanmayıb
                </p>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getBadgeVariant(issue.type)}>
                          {issue.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{issue.message}</p>
                          {issue.component && (
                            <p className="text-sm text-muted-foreground">
                              Komponent: {issue.component}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {issue.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Komponent Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">UnifiedLayout</p>
                    <p className="text-sm text-muted-foreground">32 render</p>
                  </div>
                  <Badge variant="secondary">Yaxşı</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">DataTable</p>
                    <p className="text-sm text-muted-foreground">156 render</p>
                  </div>
                  <Badge variant="secondary">Orta</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SchoolList</p>
                    <p className="text-sm text-muted-foreground">89 render</p>
                  </div>
                  <Badge variant="default">Əla</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimallaşdırma Tövsiyələri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-semibold text-green-800 dark:text-green-300">
                    ✅ Tətbiq edilmiş
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                    <li>• React.memo optimallaşdırması</li>
                    <li>• Virtual scrolling böyük siyahılar üçün</li>
                    <li>• Lazy loading komponentləri</li>
                    <li>• Debounced search</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    🔄 İcra edilir
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                    <li>• Bundle size optimallaşdırması</li>
                    <li>• Image compression</li>
                    <li>• Service worker cache</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                    📋 Planlaşdırılan
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>• Server-side rendering (SSR)</li>
                    <li>• Progressive Web App (PWA)</li>
                    <li>• CDN inteqrasiyası</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;