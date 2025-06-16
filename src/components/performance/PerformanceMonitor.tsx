import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { Monitor, Zap, TrendingUp, RefreshCw } from "lucide-react";

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  bundleSize: number;
  loadTime: number;
  componentsCount: number;
}

const PerformanceMonitor: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const collectMetrics = () => {
    const startTime = performance.now();

    // Simulate metrics collection
    const mockMetrics: PerformanceMetrics = {
      memoryUsage:
        Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) ||
        45,
      renderTime: Math.round(performance.now() - startTime),
      bundleSize: 1200, // KB
      loadTime:
        Math.round(
          performance.timing?.loadEventEnd -
            performance.timing?.navigationStart,
        ) || 2500,
      componentsCount: document.querySelectorAll("[data-testid]").length || 24,
    };

    setMetrics(mockMetrics);
  };

  const getPerformanceStatus = (
    metric: string,
    value: number,
  ): "good" | "warning" | "critical" => {
    const thresholds = {
      memoryUsage: { warning: 100, critical: 200 },
      renderTime: { warning: 100, critical: 200 },
      loadTime: { warning: 3000, critical: 5000 },
      bundleSize: { warning: 1500, critical: 2000 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "good";

    if (value >= threshold.critical) return "critical";
    if (value >= threshold.warning) return "warning";
    return "good";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    collectMetrics();

    if (isMonitoring) {
      const interval = setInterval(collectMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Performans Monitoru
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  İzlənir
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  İzləməni Başlat
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={collectMetrics}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenilə
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Yaddaş İstifadəsi</span>
                <Badge
                  className={getStatusColor(
                    getPerformanceStatus("memoryUsage", metrics.memoryUsage),
                  )}
                >
                  {metrics.memoryUsage} MB
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Render Vaxtı</span>
                <Badge
                  className={getStatusColor(
                    getPerformanceStatus("renderTime", metrics.renderTime),
                  )}
                >
                  {metrics.renderTime} ms
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Yükləmə Vaxtı</span>
                <Badge
                  className={getStatusColor(
                    getPerformanceStatus("loadTime", metrics.loadTime),
                  )}
                >
                  {(metrics.loadTime / 1000).toFixed(2)} s
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bundle Ölçüsü</span>
                <Badge
                  className={getStatusColor(
                    getPerformanceStatus("bundleSize", metrics.bundleSize),
                  )}
                >
                  {metrics.bundleSize} KB
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Komponent Sayı</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {metrics.componentsCount}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ümumi Nəticə</span>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  85/100
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Metrikleri toplamaq üçün klikləyin
          </div>
        )}

        {metrics && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Tövsiyələr</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {metrics.memoryUsage > 100 && (
                <li>• Yaddaş istifadəsini optimallaşdırın</li>
              )}
              {metrics.renderTime > 100 && (
                <li>• Render performansını optimallaşdırın</li>
              )}
              {metrics.loadTime > 3000 && (
                <li>• Yükləmə vaxtını optimallaşdırın</li>
              )}
              {metrics.bundleSize > 1500 && <li>• Bundle ölçüsünü azaldın</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
