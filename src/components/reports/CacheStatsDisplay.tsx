
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap } from 'lucide-react';

interface CacheStats {
  hitRate: number;
  totalQueries: number;
  avgResponseTime: number;
  activeConnections: number;
}

interface CacheStatsDisplayProps {
  stats: CacheStats;
}

const CacheStatsDisplay: React.FC<CacheStatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hitRate}%</div>
          <Badge variant={stats.hitRate > 80 ? "default" : "destructive"}>
            {stats.hitRate > 80 ? "Excellent" : "Needs Improvement"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQueries.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">since last reset</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
          <Badge variant={stats.avgResponseTime < 100 ? "default" : "secondary"}>
            {stats.avgResponseTime < 100 ? "Fast" : "Moderate"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeConnections}</div>
          <p className="text-xs text-muted-foreground">current connections</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheStatsDisplay;
