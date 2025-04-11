
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Category } from '@/types/category';

export interface CategoryChartProps {
  categories?: Category[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categories = [] }) => {
  const { t } = useLanguage();
  
  // Kateqoriya tiplərinə görə statistika
  const getAssignmentStats = () => {
    const stats = {
      all: 0,
      sectors: 0,
      other: 0
    };
    
    categories.forEach(category => {
      if (category.assignment === 'all') {
        stats.all++;
      } else if (category.assignment === 'sectors') {
        stats.sectors++;
      } else {
        stats.other++;
      }
    });
    
    return [
      { name: t('allAssignment'), value: stats.all },
      { name: t('sectorsAssignment'), value: stats.sectors },
      { name: t('otherAssignment'), value: stats.other }
    ];
  };
  
  const data = getAssignmentStats();
  
  // Qrafik üçün rənglər
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categoryDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.some(item => item.value > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Kateqoriya sayı']}
                labelFormatter={(name) => `${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">{t('noDataAvailable')}</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-xs">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
