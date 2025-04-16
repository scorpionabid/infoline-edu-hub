
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SectorCompletionItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface CompletionChartProps {
  sectors: SectorCompletionItem[];
}

const CompletionChart: React.FC<CompletionChartProps> = ({ sectors }) => {
  const { t } = useLanguage();
  
  const chartData = sectors.map(sector => ({
    name: sector.name,
    value: sector.completionRate || sector.completionPercentage || 0
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#4ECDC4', '#FF9F1C'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectorCompletionRate')}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground">
            {t('noDataAvailable')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, t('completion')]}
                labelFormatter={(name) => `${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletionChart;
