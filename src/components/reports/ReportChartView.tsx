
import React from 'react';
import { Report } from '@/types/report';
import ChartView from './views/ChartView';

interface ReportChartViewProps {
  report: Report;
}

const ReportChartView: React.FC<ReportChartViewProps> = ({ report }) => {
  // Determine which type of visualization to render based on report type
  const renderReportVisualization = () => {
    if (!report || !report.content) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Hesabat məlumatı yoxdur</p>
        </div>
      );
    }

    const data = Array.isArray(report.content.data) 
      ? report.content.data 
      : (report.content.chartData || []);

    const config = report.content.config || {};
    
    switch (report.type) {
      case 'BAR':
        return <ChartView data={data} config={config} type="bar" />;
      case 'LINE':
        return <ChartView data={data} config={config} type="line" />;
      case 'PIE':
        return <ChartView data={data} config={config} type="pie" />;
      case 'TABLE':
        return (
          <div className="text-center py-10 text-muted-foreground">
            Cədvəl görünüşü hazırlanmaqdadır
          </div>
        );
      case 'METRICS':
        return (
          <div className="text-center py-10 text-muted-foreground">
            Metrika görünüşü hazırlanmaqdadır
          </div>
        );
      default:
        return (
          <div className="text-center py-10 text-muted-foreground">
            {`${report.type} tipli hesabat görünüşü hazırlanmaqdadır`}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderReportVisualization()}
    </div>
  );
};

export default ReportChartView;
