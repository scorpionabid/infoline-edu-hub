
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Report, ReportType } from '@/types/report'; 

interface ReportChartProps {
  report: Report;
}

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
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
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
