
import React from 'react';
import { BarChart, LineChart, PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Pie, Line } from 'recharts';
import { useTheme } from 'next-themes';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ReportChartProps {
  reportType: string;
  data: any[];
}

const ReportChart: React.FC<ReportChartProps> = ({ reportType, data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const colors = [
    '#8B5CF6', // Purple
    '#0EA5E9', // Blue 
    '#10B981', // Green
    '#F97316', // Orange
    '#EC4899', // Pink
    '#F43F5E', // Red
    '#A78BFA', // Light purple
    '#60A5FA', // Light blue
  ];
  
  const chartConfig = {
    purple: { color: colors[0] },
    blue: { color: colors[1] },
    green: { color: colors[2] },
    orange: { color: colors[3] },
    pink: { color: colors[4] },
    red: { color: colors[5] },
    lightPurple: { color: colors[6] },
    lightBlue: { color: colors[7] },
  };
  
  const renderChart = () => {
    switch (reportType) {
      case 'statistics':
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill={colors[0]} name="value" />
            </BarChart>
          </ChartContainer>
        );
      
      case 'completion':
        return (
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        );
        
      case 'comparison':
        return (
          <ChartContainer config={chartConfig}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              {data[0]?.comparisonValue && (
                <Line
                  type="monotone"
                  dataKey="comparisonValue"
                  stroke={colors[1]}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ChartContainer>
        );
        
      default:
        return <div>Chart type not supported</div>;
    }
  };
  
  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
};

export default ReportChart;
