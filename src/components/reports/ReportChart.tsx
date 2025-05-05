
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Report, ReportType, ReportChartProps } from '@/types/report'; 

const ReportChart: React.FC<ReportChartProps> = ({ report }) => {
  if (!report || !report.content) {
    return <Card>
      <CardContent>
        Məlumat yoxdur
      </CardContent>
    </Card>;
  }

  const chartData = report.content;
  const chartType = report.type;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: report.title,
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <div>Bar Chart Vizualizasiya ({report.title})</div>;
      case 'pie':
        return <div>Pie Chart Vizualizasiya ({report.title})</div>;
      case 'line':
        return <div>Line Chart Vizualizasiya ({report.title})</div>;
      default:
        return <p>Grafik növü dəstəklənmir</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ReportChart;
