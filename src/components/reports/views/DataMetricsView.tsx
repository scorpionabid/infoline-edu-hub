
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataMetric {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface DataMetricsViewProps {
  data: Record<string, any>[];
  metrics?: DataMetric[];
}

const DataMetricsView: React.FC<DataMetricsViewProps> = ({ data, metrics = [] }) => {
  // Əgər metrics təyin olunmayıbsa, verilən məlumatlardan avtomatik metrika yarat
  const calculatedMetrics: DataMetric[] = metrics.length > 0 
    ? metrics 
    : data.length > 0 
      ? [
          { 
            title: 'Ümumi məlumat sayı', 
            value: data.length 
          },
          // Burada əlavə dinamik metrikalar hesablana bilər
        ]
      : [];

  if (calculatedMetrics.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">Metrika məlumatları yoxdur</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {calculatedMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.change !== undefined && (
              <p className={`text-xs ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}% {metric.changeLabel || ''}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DataMetricsView;
