
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface SectorCompletionItem {
  id: string;
  name: string;
  completion: number;
  schoolCount: number;
}

interface CompletionChartProps {
  data: SectorCompletionItem[];
}

export const CompletionChart: React.FC<CompletionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tamamlama Dərəcələri</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Göstəriləcək məlumat yoxdur</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.name,
    tamamlanma: Math.round(item.completion),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tamamlama Dərəcələri</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Tamamlama']} />
            <Bar dataKey="tamamlanma" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
