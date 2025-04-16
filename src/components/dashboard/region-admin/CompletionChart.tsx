import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectorCompletionItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CompletionChartProps {
  data?: SectorCompletionItem[] | any[];
}

const CompletionChart: React.FC<CompletionChartProps> = ({ data = [] }) => {
  const { t } = useLanguage();
  const colors = ['#4f46e5', '#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#059669', '#ca8a04'];
  
  // Əgər data array deyilsə, boş array istifadə et
  const sectors = Array.isArray(data) ? data : [];
  
  // Hazır məlumatlar sətri
  const chartData = sectors.map((sector, index) => ({
    name: sector.name,
    value: sector.completionRate,
    fill: colors[index % colors.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectorCompletion')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sectors.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {t('noSectorsData')}
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={1}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletionChart;
