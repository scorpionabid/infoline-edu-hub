
import React from 'react';
import { SectorCompletion } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompletionChartProps {
  data: SectorCompletion[];
}

const CompletionChart: React.FC<CompletionChartProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Qrafikin məlumatlarını hazırlayaq
  const chartData = data.map(item => ({
    name: item.name,
    completion: item.completionRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('completionRateBySector')}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={chartData}
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
                <Tooltip 
                  formatter={(value) => [`${value}%`, t('completionRate')]}
                  labelFormatter={(name) => name}
                />
                <Bar dataKey="completion" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">{t('noDataToDisplay')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletionChart;
