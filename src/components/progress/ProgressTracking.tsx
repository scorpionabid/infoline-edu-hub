import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Clock,
  School,
  Award,
  // AlertTriangle
} from 'lucide-react';

interface ProgressData {
  schoolId: string;
  schoolName: string;
  completionRate: number;
  totalFields: number;
  completedFields: number;
  lastUpdated: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  category: string;
  deadline?: string;
}

interface ProgressTrackingProps {
  data?: ProgressData[];
  onSchoolClick?: (schoolId: string) => void;
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({
  data = [],
  // onSchoolClick
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');

  // Mock data if no data provided
  const mockData: ProgressData[] = [
    {
      schoolId: '1',
      schoolName: 'Azərbaycan Dövlət Universitet Məktəbi',
      completionRate: 85,
      totalFields: 45,
      completedFields: 38,
      lastUpdated: '2024-01-15',
      status: 'in_progress',
      category: 'Universitetlər',
      deadline: '2024-02-01'
    },
    {
      schoolId: '2',
      schoolName: 'Qafqaz Universitet Lisey Məktəbi',
      completionRate: 45,
      totalFields: 45,
      completedFields: 20,
      lastUpdated: '2024-01-10',
      status: 'in_progress',
      category: 'Liseylər',
      deadline: '2024-02-01'
    },
    {
      schoolId: '3',
      schoolName: 'Nizami adına Məktəb',
      completionRate: 92,
      totalFields: 45,
      completedFields: 41,
      lastUpdated: '2024-01-18',
      status: 'completed',
      category: 'Ümumi təhsil',
      deadline: '2024-02-01'
    },
    {
      schoolId: '4',
      schoolName: 'Füzuli rayon məktəbi',
      completionRate: 23,
      totalFields: 45,
      completedFields: 10,
      lastUpdated: '2024-01-05',
      status: 'overdue',
      category: 'Ümumi təhsil',
      deadline: '2024-01-20'
    }
  ];

  const progressData = data.length > 0 ? data : mockData;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSchools = progressData.length;
    const completed = progressData.filter(d => d.status === 'completed').length;
    const inProgress = progressData.filter(d => d.status === 'in_progress').length;
    const overdue = progressData.filter(d => d.status === 'overdue').length;
    const avgCompletion = Math.round(
      progressData.reduce((sum, d) => sum + d.completionRate, 0) / totalSchools
    );

    return {
      totalSchools,
      completed,
      inProgress,
      overdue,
      avgCompletion,
      onTrack: completed + inProgress,
      completionPercentage: Math.round((completed / totalSchools) * 100)
    };
  }, [progressData]);

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { label: 'Tamamlanıb', className: 'bg-green-100 text-green-800' },
      in_progress: { label: 'Davam edir', className: 'bg-blue-100 text-blue-800' },
      overdue: { label: 'Gecikib', className: 'bg-red-100 text-red-800' },
      not_started: { label: 'Başlanmayıb', className: 'bg-gray-100 text-gray-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.not_started;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': {
        return <Award className="h-4 w-4 text-green-600" />;
      }
      case 'overdue': {
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      }
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Proqres İzləmə</h1>
          <p className="text-muted-foreground">Məktəblərin məlumat doldurma vəziyyəti</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant={viewMode === 'overview' ? 'default' : 'outline'} onClick={() => setViewMode('overview')}>
            Ümumi
          </Button>
          <Button variant={viewMode === 'detailed' ? 'default' : 'outline'} onClick={() => setViewMode('detailed')}>
            Ətraflı
          </Button>
          <Button variant={viewMode === 'trends' ? 'default' : 'outline'} onClick={() => setViewMode('trends')}>
            // Tendensiyalar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi məktəblər</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanıb</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionPercentage}% ümumi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Davam edir</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orta tamamlama</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <Progress value={stats.avgCompletion} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as any)}>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ümumi Baxış</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.slice(0, 3).map((school) => (
                  <div key={school.schoolId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{school.schoolName}</span>
                      <span className="text-sm">{school.completionRate}%</span>
                    </div>
                    <Progress value={school.completionRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Vəziyyətə görə Paylanma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      Tamamlanıb
                    </span>
                    <span className="font-medium">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Davam edir
                    </span>
                    <span className="font-medium">{stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Gecikmiş
                    </span>
                    <span className="font-medium">{stats.overdue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ətraflı Məktəb Siyahısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.map((school) => (
                  <div
                    key={school.schoolId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSchoolClick?.(school.schoolId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{school.schoolName}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(school.status)}
                          {getStatusBadge(school.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            {school.completedFields}/{school.totalFields} sahə doldurulub
                          </span>
                          <span className="font-medium">{school.completionRate}%</span>
                        </div>
                        <Progress value={school.completionRate} className="w-full" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Son yenilənmə: {new Date(school.lastUpdated).toLocaleDateString('az')}</span>
                        {school.deadline && (
                          <span>Son tarix: {new Date(school.deadline).toLocaleDateString('az')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Tamamlama Tendensiyası</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tendensiya analizi hazırlanır...</p>
                  <p className="text-sm mt-2">Tezliklə qrafiklər və analitik məlumatlar əlavə ediləcək.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bu həftə artım</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-green-600">+12%</div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Proqnoz (növbəti həftə)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">78%</div>
                <p className="text-xs text-muted-foreground">Gözlənilən tamamlama</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Son tarixə qədər</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">12</div>
                <p className="text-xs text-muted-foreground">Gün qalıb</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracking;