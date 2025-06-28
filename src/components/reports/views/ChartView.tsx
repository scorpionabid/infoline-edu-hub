
import React from 'react';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ReportTypeValues } from '@/types/core/report';

interface ChartViewProps {
  data: any[];
  config?: {
    xAxisKey?: string;
    yAxisKey?: string;
    title?: string;
    colors?: string[];
    stacked?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    labelKey?: string;
    valueKey?: string;
    [key: string]: any;
  };
  type: ReportTypeValues;
  height?: number;
  width?: number;
}

const defaultConfig = {
  xAxisKey: 'name',
  yAxisKey: 'value',
  labelKey: 'name',
  valueKey: 'value',
  showGrid: true,
  showLegend: true,
  legendPosition: 'bottom' as const,
  colors: ['#5D87FF', '#FF87D4', '#2BD4BD', '#FFA87D', '#9C87FF', '#FFD572']
};

const ChartView: React.FC<ChartViewProps> = ({ 
  data, 
  config = {}, 
  type, 
  height = 400, 
  width = 600 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-muted-foreground">Məlumat tapılmadı</p>
      </div>
    );
  }

  // Merge default config with provided config
  const chartConfig = { ...defaultConfig, ...config };
  const { 
    xAxisKey, 
    yAxisKey, 
    colors, 
    showGrid, 
    showLegend, 
    legendPosition,
    labelKey,
    // valueKey
  } = chartConfig;

  // Get all available data keys except the xAxisKey
  const dataKeys = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== xAxisKey)
    : [];

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar': {
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend layout="horizontal" verticalAlign={legendPosition as any} />}
            
            {dataKeys.length > 1 
              ? dataKeys.map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={colors[index % colors.length]} 
                    stackId={chartConfig.stacked ? "stack" : undefined}
                  />
                ))
              : <Bar dataKey={yAxisKey} fill={colors[0]} />
            }
          </BarChart>
        );
      }
      
      case 'line': {
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend layout="horizontal" verticalAlign={legendPosition as any} />}
            
            {dataKeys.length > 1 
              ? dataKeys.map((key, index) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]} 
                    activeDot={{ r: 8 }} 
                  />
                ))
              : <Line type="monotone" dataKey={yAxisKey} stroke={colors[0]} activeDot={{ r: 8 }} />
            }
          </LineChart>
        );
      }
      
      case 'pie': {
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius || 0}
              outerRadius={config.outerRadius || "80%"}
              labelLine={config.showLabels !== false}
              label={config.showLabels !== false ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
              dataKey={yAxisKey}
              nameKey={labelKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showLegend && <Legend layout="horizontal" verticalAlign={legendPosition as any} />}
            <Tooltip />
          </PieChart>
        );
      }
      
      default:
        return <div className="text-center p-10">Dəstəklənməyən qrafik növü</div>;
    }
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartView;
