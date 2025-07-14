
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis,
  Legend,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { StatisticsData } from '@/services/statisticsService';

interface StatisticsChartsProps {
  data: StatisticsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ data }) => {
  // Pie chart üçün form statusları
  const pieData = [
    { name: 'Təsdiqləndi', value: data.formsByStatus.approved, color: '#10b981' },
    { name: 'Gözləyir', value: data.formsByStatus.pending, color: '#f59e0b' },
    { name: 'Rədd edildi', value: data.formsByStatus.rejected, color: '#ef4444' },
    { name: 'Qaralama', value: data.formsByStatus.draft, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Top performanslı məktəblər (ilk 10)
  const topSchools = data.schoolPerformance
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 10);

  // Sektor performansı
  const sectorData = data.sectorPerformance;

  // Vaxt seriya məlumatları
  const timeSeriesData = data.timeSeriesData;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Form statusları - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Form Statusları</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Günlük aktivlik - Line Chart */}
      {timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Günlük Aktivlik</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('az-AZ')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('az-AZ')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#8884d8" 
                  name="Təqdimatlar"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="approvals" 
                  stroke="#82ca9d" 
                  name="Təsdiqlər"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top məktəblər - Bar Chart */}
      {topSchools.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ən Yaxşı Performanslı Məktəblər</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topSchools} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Tamamlanma dərəcəsi']}
                />
                <Bar 
                  dataKey="completionRate" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sektor performansı - Area Chart */}
      {sectorData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sektor Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Ortalama tamamlanma']}
                />
                <Area 
                  type="monotone" 
                  dataKey="averageCompletion" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatisticsCharts;
