
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CompletionChartProps {
  percentage: number;
  total: number;
  completed: number;
}

export const CompletionChart: React.FC<CompletionChartProps> = ({
  percentage,
  total,
  // completed
}) => {
  const remaining = total - completed;
  
  const data = [
    { name: 'Tamamlanmış', value: completed, color: '#4ade80' },
    { name: 'Qalan', value: remaining, color: '#e5e7eb' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">{percentage}%</span>
          <span className="text-sm text-muted-foreground">
            {completed} / {total} tamamlanıb
          </span>
        </div>
        <Progress value={percentage} className="h-2 mt-2" />
      </div>

      {total > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
