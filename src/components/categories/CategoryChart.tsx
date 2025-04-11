
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface CategoryChartProps {
  categories?: Category[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categories = [] }) => {
  const { t } = useLanguage();
  
  // Statuslarına görə kateqoriyaları qruplaşdıraq
  const statusCounts = categories.reduce((acc, category) => {
    const status = category.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Chart data formatına çevirək
  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: t(name) || name,
    value
  }));
  
  // Diaqram üçün rənglər
  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#9e9e9e'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categoryStatusDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">{t('noDataAvailable')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
