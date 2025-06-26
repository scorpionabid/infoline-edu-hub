
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Activity, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { enhancedCache } from '@/services/cache/EnhancedCacheService';
import { translationCache } from '@/services/translationCache';
import { useMemoryOptimization } from '@/hooks/performance/useMemoryOptimization';

export const CacheMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { forceCleanup, getMemoryStats } = useMemoryOptimization();

  const refreshStats = () => {
    try {
      const cacheStats = enhancedCache.getStats();
      const translationStats = translationCache.getInfo();
      const memoryStats = getMemoryStats();
      
      setStats({
        cache: cacheStats,
        translations: translationStats,
        memory: memoryStats
      });
    } catch (error) {
      console.error('Failed to refresh cache stats:', error);
    }
  };

  useEffect(() => {
    refreshStats();
    
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [getMemoryStats]);

  const handleClearCache = () => {
    try {
      enhancedCache.clear();
      refreshStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleClearTranslations = () => {
    try {
      translationCache.clear();
      refreshStats();
    } catch (error) {
      console.error('Failed to clear translations:', error);
    }
  };

  const handleForceCleanup = () => {
    try {
      forceCleanup();
      refreshStats();
    } catch (error) {
      console.error('Failed to force cleanup:', error);
    }
  };

  if (!stats) {
    return <div className="flex items-center justify-center p-4">Yüklənir...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cache Monitoru
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'Onlayn' : 'Oflayn'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Cache Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.cache?.memorySize || 0}</div>
              <div className="text-sm text-muted-foreground">Memory Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.cache?.hitRate || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.cache?.version || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Cache Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.translations?.languages?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
          </div>

          {/* Memory Stats */}
          {stats.memory?.memory && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Memory Usage
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Used:</span>
                  <span className="ml-2 font-medium">{stats.memory.memory.used}, MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium">{stats.memory.memory.total}, MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Limit:</span>
                  <span className="ml-2 font-medium">{stats.memory.memory.limit}, MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Translation Cache */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Translation Cache</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {(stats.translations?.languages || []).map((lang: string) => (
                <Badge 
                  key={lang} 
                  variant={lang === 'az' ? "default" : "secondary"}
                >
                  {lang.toUpperCase()}
                  {lang === 'az' && ' (Priority)'}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Priority Language: {stats.translations?.priority ? '✅' : '❌'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={refreshStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenilə
            </Button>
            <Button onClick={handleForceCleanup} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              // Cleanup
            </Button>
            <Button 
              onClick={handleClearTranslations} 
              variant="outline" 
              size="sm"
              className="text-orange-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Translations
            </Button>
            <Button 
              onClick={handleClearCache} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheMonitor;
