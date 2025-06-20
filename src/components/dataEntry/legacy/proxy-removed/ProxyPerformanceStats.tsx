import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Database } from 'lucide-react';

interface ProxyPerformanceStatsProps {
  loadingTime?: number;
  queryCacheHits?: number;
  totalQueries?: number;
  formFieldsCount?: number;
  autoSaveFrequency?: number;
}

const ProxyPerformanceStats: React.FC<ProxyPerformanceStatsProps> = ({
  loadingTime = 0,
  queryCacheHits = 0,
  totalQueries = 0,
  formFieldsCount = 0,
  autoSaveFrequency = 30
}) => {
  const cacheHitRate = totalQueries > 0 ? (queryCacheHits / totalQueries) * 100 : 0;
  
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4" />
          Performance Statistikası
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Yükləmə vaxtı</p>
              <p className="text-sm font-medium">{loadingTime}ms</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Sahə sayı</p>
              <p className="text-sm font-medium">{formFieldsCount}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
            <Badge variant={cacheHitRate > 80 ? 'default' : 'secondary'}>
              {cacheHitRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={cacheHitRate} className="h-2" />
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>Auto-save: Hər {autoSaveFrequency} saniyə</p>
          <p>Query cache: 5 dəqiqə TTL</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProxyPerformanceStats;
