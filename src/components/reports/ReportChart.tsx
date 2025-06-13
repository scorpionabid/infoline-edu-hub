
import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ReportChartProps, REPORT_TYPE_VALUES } from '@/types/core/report';

export const ReportChart: React.FC<ReportChartProps> = ({ 
  type, 
  data = [], 
  config, 
  title, 
  description, 
  report, 
  height = 400, 
  width = 600 
}) => {
  const renderChart = () => {
    // Use the type prop if provided, otherwise try to get it from the report
    const chartType = type || (report?.type || REPORT_TYPE_VALUES.BAR);
    
    if (chartType === REPORT_TYPE_VALUES.BAR) {
      return <div className="flex items-center justify-center h-full"><BarChart size={64} className="text-muted-foreground" /></div>;
    } else if (chartType === REPORT_TYPE_VALUES.LINE) {
      return <div className="flex items-center justify-center h-full"><LineChart size={64} className="text-muted-foreground" /></div>;
    } else if (chartType === REPORT_TYPE_VALUES.PIE) {
      return <div className="flex items-center justify-center h-full"><PieChart size={64} className="text-muted-foreground" /></div>;
    } else {
      return <div className="flex items-center justify-center h-full text-muted-foreground">No chart available</div>;
    }
  };

  return (
    <Card className="p-4" style={{ height, width }}>
      {renderChart()}
    </Card>
  );
};

export default ReportChart;
