
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMemoryOptimization } from '@/hooks/performance/useMemoryOptimization';
import { useCrossTabSync } from '@/hooks/common/useCrossTabSync';
import { CacheMonitor } from './CacheMonitor';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  RefreshCw,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  network: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
  rendering: {
    avgFrameTime: number;
    droppedFrames: number;
  };
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    cache: { hits: 0, misses: 0, hitRate: 0 },
    network: { requests: 0, errors: 0, avgResponseTime: 0 },
    rendering: { avgFrameTime: 0, droppedFrames: 0 }
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [tabCount, setTabCount] = useState(1);

  const { forceCleanup, getMemoryStats, checkMemoryUsage } = useMemoryOptimization({
    onMemoryPressure: () => {
      console.log('Memory pressure detected - triggering cleanup');
    }
  });

  const { sendMessage } = useCrossTabSync({
    channel: 'performance-monitoring',
    onMessage: (data) => {
      if (data.type === 'performance_update') {
        console.log('Performance update from another tab:', data);
      }
    },
    onTabsChange: (count) => {
      setTabCount(count);
    }
  });

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    const interval = setInterval(() => {
      updateMetrics();
      sendMessage({
        type: 'performance_update',
        metrics: metrics,
        timestamp: Date.now()
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  };

  const updateMetrics = () => {
    // Get memory stats
    const memoryStats = getMemoryStats();
    
    // Simulate other metrics (in real app, these would come from actual monitoring)
    const newMetrics: PerformanceMetrics = {
      memory: memoryStats.memory || { used: 0, total: 0, percentage: 0 },
      cache: {
        hits: Math.floor(Math.random() * 1000) + 500,
        misses: Math.floor(Math.random() * 100) + 20,
        hitRate: Math.floor(Math.random() * 20) + 80
      },
      network: {
        requests: Math.floor(Math.random() * 50) + 100,
        errors: Math.floor(Math.random() * 5),
        avgResponseTime: Math.floor(Math.random() * 200) + 100
      },
      rendering: {
        avgFrameTime: Math.random() * 10 + 5,
        droppedFrames: Math.floor(Math.random() * 3)
      }
    };

    setMetrics(newMetrics);
  };

  useEffect(() => {
    updateMetrics();
    
    if (isMonitoring) {
      return startMonitoring();
    }
  }, [isMonitoring]);

  const getPerformanceScore = (): number => {
    const memoryScore = Math.max(0, 100 - metrics.memory.percentage);
    const cacheScore = metrics.cache.hitRate;
    const networkScore = Math.max(0, 100 - (metrics.network.avgResponseTime / 10));
    const renderScore = Math.max(0, 100 - (metrics.rendering.avgFrameTime * 5));
    
    return Math.round((memoryScore + cacheScore + networkScore + renderScore) / 4);
  };

  const performanceScore = getPerformanceScore();
  const scoreColor = performanceScore >= 80 ? 'text-green-600' : 
                    performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Sistem performansı və cache monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={tabCount > 1 ? "secondary" : "default"}>
            {tabCount} Tab{tabCount > 1 ? 's' : ''}
          </Badge>
          <Button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            <Activity className="mr-2 h-4 w-4" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${scoreColor}`}>
              {performanceScore}
            </div>
            <div className="flex-1">
              <Progress value={performanceScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {performanceScore >= 80 ? 'Excellent' : 
                 performanceScore >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            {performanceScore >= 80 ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memory.used}MB
            </div>
            <div className="mt-2">
              <Progress value={metrics.memory.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.memory.percentage.toFixed(1)}% of {metrics.memory.total}MB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.cache.hitRate}%
            </div>
            <div className="mt-2">
              <Progress value={metrics.cache.hitRate} />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.cache.hits} hits, {metrics.cache.misses} misses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.network.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.network.requests} requests, {metrics.network.errors} errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendering</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.rendering.avgFrameTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.rendering.droppedFrames} dropped frames
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="cache" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="memory">Memory Optimization</TabsTrigger>
          <TabsTrigger value="network">Network Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="cache">
          <CacheMonitor />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Memory Cleanup</h4>
                  <p className="text-sm text-muted-foreground">
                    Force garbage collection and cache cleanup
                  </p>
                </div>
                <Button onClick={forceCleanup} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Force Cleanup
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Memory Check</h4>
                  <p className="text-sm text-muted-foreground">
                    Check current memory usage and pressure
                  </p>
                </div>
                <Button onClick={checkMemoryUsage} variant="outline">
                  <HardDrive className="mr-2 h-4 w-4" />
                  Check Memory
                </Button>
              </div>

              {metrics.memory.percentage > 80 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    High memory usage detected. Consider running cleanup.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.network.requests}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.network.avgResponseTime}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${metrics.network.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.network.errors}
                    </div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
                
                {metrics.network.errors > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">
                      Network errors detected. Check connectivity and API endpoints.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
