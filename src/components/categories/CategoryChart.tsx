
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Category } from '@/types/category';

export interface CategoryChartProps {
  categoriesData: Category[];
  loading: boolean;
}

const COLORS = ['#10b981', '#6b7280', '#f59e0b'];

const CategoryChart: React.FC<CategoryChartProps> = ({ categoriesData, loading }) => {
  // Yüklənmə halı
  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Kateqoriyaların Statusu</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 h-64 flex items-center justify-center">
          <div className="animate-pulse h-48 w-48 bg-muted rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  // Status məlumatlarını hazırlayaq
  const activeCount = categoriesData.filter(cat => cat.status === 'active').length;
  const inactiveCount = categoriesData.filter(cat => cat.status === 'inactive').length;
  const draftCount = categoriesData.filter(cat => cat.status === 'draft').length;
  
  const chartData = [
    { name: 'Aktiv', value: activeCount },
    { name: 'Deaktiv', value: inactiveCount },
    { name: 'Qaralama', value: draftCount }
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Kateqoriyaların Statusu</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-64">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Məlumat yoxdur</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} kateqoriya`, 'Sayı']}
                labelFormatter={(name) => `${name}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
