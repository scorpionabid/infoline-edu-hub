
import React from 'react';
import { ProgressWidget } from './ProgressWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Calendar, Download, RefreshCw } from 'lucide-react';

interface ProgressDashboardProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onRefresh,
  onExport
}) => {
  // Mock data for widgets
  const widgetData = [
    {
      title: 'Ümumi Tamamlama',
      currentValue: 67,
      targetValue: 85,
      unit: '%',
      trend: { value: 12, direction: 'up' as const, period: 'bu həftə' },
      status: 'on-track' as const
    },
    {
      title: 'Məktəb Sayı',
      currentValue: 18,
      targetValue: 24,
      unit: '',
      trend: { value: 3, direction: 'up' as const, period: 'bu həftə' },
      status: 'at-risk' as const
    },
    {
      title: 'Vaxtında Tamamlama',
      currentValue: 12,
      targetValue: 20,
      unit: '',
      trend: { value: 2, direction: 'down' as const, period: 'bu həftə' },
      status: 'behind' as const
    },
    {
      title: 'Orta Cavab Vaxtı',
      currentValue: 2.3,
      targetValue: 2.0,
      unit: 'gün',
      trend: { value: 0.5, direction: 'down' as const, period: 'bu həftə' },
      status: 'on-track' as const
    }
  ];

  // Mock chart data
  const progressChartData = [
    { name: '1 Yan', value: 15 },
    { name: '5 Yan', value: 25 },
    { name: '10 Yan', value: 40 },
    { name: '15 Yan', value: 55 },
    { name: '20 Yan', value: 68 },
    { name: 'Bu gün', value: 67 }
  ];

  const categoryData = [
    { name: 'Universitetlər', completed: 8, total: 10 },
    { name: 'Liseylər', completed: 5, total: 8 },
    { name: 'Ümumi təhsil', completed: 5, total: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proqres Dashboard</h2>
          <p className="text-muted-foreground">Real-vaxt məlumat doldurma statistikası</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenilə
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            İxrac et
          </Button>
        </div>
      </div>

      {/* Progress Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgetData.map((widget, index) => (
          <ProgressWidget
            key={index}
            title={widget.title}
            currentValue={widget.currentValue}
            targetValue={widget.targetValue}
            unit={widget.unit}
            trend={widget.trend}
            status={widget.status}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Tamamlama Tendensiyası</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kateqoriyalara görə Proqres</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#22c55e" name="Tamamlanıb" />
                <Bar dataKey="total" fill="#e5e7eb" name="Ümumi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bu həftənin hədəfi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">75%</div>
            <p className="text-xs text-muted-foreground">8% qalıb</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ən yüksək performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">Nizami adına Məktəb</div>
            <p className="text-xs text-muted-foreground">92% tamamlanıb</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diqqət tələb edir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">Füzuli rayon məktəbi</div>
            <p className="text-xs text-muted-foreground">23% tamamlanıb</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboard;
