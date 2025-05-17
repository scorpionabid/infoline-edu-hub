
import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Report, ReportChartProps, ReportTypeValues } from '@/types/report';

export const ReportChart: React.FC<ReportChartProps> = ({ report, height = 400, width = 600 }) => {
  const renderChart = () => {
    // Convert the report type to uppercase for comparison
    const reportType = report.type.toUpperCase();
    
    // Use the correct string comparison approach
    if (reportType === 'BAR') {
      return <div className="flex items-center justify-center h-full"><BarChart size={64} className="text-muted-foreground" /></div>;
    } else if (reportType === 'LINE') {
      return <div className="flex items-center justify-center h-full"><LineChart size={64} className="text-muted-foreground" /></div>;
    } else if (reportType === 'PIE') {
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
