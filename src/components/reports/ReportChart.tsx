import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { ReportType } from '@/types/form';

interface ReportChartProps {
  data: any[];
  type: ReportType;
}

const ReportChart: React.FC<ReportChartProps> = ({ data, type }) => {
  const { t } = useLanguage();

  const renderChart = () => {
    if (type === ReportType.STATISTICS) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    else if (type === ReportType.COMPLETION) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#82ca9d" />
            <Bar dataKey="pending" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    else if (type === ReportType.COMPARISON) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="groupA" fill="#8884d8" />
            <Bar dataKey="groupB" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return <p>{t('noChartData')}</p>;
  };

  const report = {
    name: "Example Report",
    summary: "This is a summary of the report."
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">{report.name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{report.summary}</p>
      <div className="text-sm text-muted-foreground mb-2">{report.summary}</div>
      {renderChart()}
    </div>
  );
};

export default ReportChart;
