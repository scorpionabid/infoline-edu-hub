
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportChartProps {
  reportId?: string;
  data?: any[];
  title?: string;
  className?: string;
}

const ReportChart: React.FC<ReportChartProps> = ({ 
  reportId, 
  data = [],
  title,
  className
}) => {
  const { t } = useLanguage();
  
  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-[300px] flex flex-col items-center justify-center border rounded-md bg-slate-50 dark:bg-slate-900 p-6 ${className}`}>
        <p className="text-muted-foreground">{t('noChartDataAvailable')}</p>
        {reportId && <p className="text-xs text-muted-foreground">ID: {reportId}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full h-[300px] border rounded-md bg-slate-50 dark:bg-slate-900 p-4 ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;
