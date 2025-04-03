
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface StatusDistributionChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

const COLORS = ['#4ade80', '#facc15', '#f87171', '#fb923c', '#60a5fa'];

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
  const { t } = useLanguage();
  
  const formattedData = data.map(item => ({
    name: t(item.status.toLowerCase()), // status adını tərcümə edirik
    value: item.count,
    status: item.status.toLowerCase()
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value, t('count')]}
            labelFormatter={(_, data) => data[0].payload.name}
          />
          <Legend 
            formatter={(value, entry) => t(entry.payload.status)}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistributionChart;
