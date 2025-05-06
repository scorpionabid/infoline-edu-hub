
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

interface DataMetricsViewProps {
  data: Record<string, any>[];
  metrics?: Array<{
    key: string;
    title: string;
    format?: (value: any) => string | number;
    description?: string;
  }>;
}

const DataMetricsView: React.FC<DataMetricsViewProps> = ({ 
  data, 
  metrics = [
    { key: 'total', title: 'Ümumi' },
    { key: 'average', title: 'Orta' },
    { key: 'min', title: 'Minimum' },
    { key: 'max', title: 'Maksimum' }
  ] 
}) => {
  // Default metrics calculation if no data provided
  const defaultMetrics = {
    total: data.length,
    average: 'N/A',
    min: 'N/A',
    max: 'N/A'
  };
  
  return (
    <Grid cols={{ default: 1, sm: 2, md: 4 }} className="gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.title}
          value={metric.format ? metric.format(data[metric.key]) : data[metric.key] || defaultMetrics[metric.key as keyof typeof defaultMetrics]}
          description={metric.description}
        />
      ))}
    </Grid>
  );
};

export default DataMetricsView;
