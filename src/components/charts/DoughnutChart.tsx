
import React from 'react';
import { Pie } from 'recharts';
import { PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface DoughnutChartProps {
  data: ChartData[];
  innerRadius?: number;
  outerRadius?: number;
  width?: number;
  height?: number;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  innerRadius = 60,
  outerRadius = 80,
  width = 300,
  height = 300,
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DoughnutChart;
