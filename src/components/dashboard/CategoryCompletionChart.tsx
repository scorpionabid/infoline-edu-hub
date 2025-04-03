
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryCompletionChartProps {
  data: {
    name: string;
    completed: number;
  }[];
}

const CategoryCompletionChart: React.FC<CategoryCompletionChartProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Rəng paletlərini təyin edirik
  const getColor = (value: number) => {
    if (value < 30) return '#f87171'; // red-400
    if (value < 70) return '#facc15'; // yellow-400
    return '#4ade80'; // green-400
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: '%', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, t('completion')]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="completed" name={t('completionRate')}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.completed)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryCompletionChart;
