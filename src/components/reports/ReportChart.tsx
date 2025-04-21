
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ReportChartProps {
  reportId: string;
}

const ReportChart: React.FC<ReportChartProps> = ({ reportId }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center border rounded-md bg-slate-50 p-6">
      <p className="text-muted-foreground">{t('loadingReportChartData')} (ID: {reportId})</p>
      <div className="mt-4 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>
  );
};

export default ReportChart;
