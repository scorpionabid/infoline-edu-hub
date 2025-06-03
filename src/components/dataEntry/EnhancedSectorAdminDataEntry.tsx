
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Edit, 
  Send,
  School,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BulkNotificationDialog } from '@/components/notifications/BulkNotificationDialog';
import { SingleNotificationDialog } from '@/components/notifications/SingleNotificationDialog';
import { toast } from 'sonner';
import { School as SchoolType } from '@/types/school';

interface LocalSchool {
  id: string;
  name: string;
  completion_rate: number;
  status: 'active' | 'inactive';
  last_updated?: string;
  region_id: string;
  sector_id: string;
}

interface EnhancedSectorAdminDataEntryProps {
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
  onBulkAction?: (action: string, schoolIds: string[]) => void;
}

export const EnhancedSectorAdminDataEntry: React.FC<EnhancedSectorAdminDataEntryProps> = ({
  onDataEntry,
  onSendNotification,
  onBulkAction
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock data
  const schools: LocalSchool[] = [
    {
      id: '1',
      name: 'Azərbaycan Dövlət Universitet Məktəbi',
      completion_rate: 85,
      status: 'active',
      last_updated: '2024-01-15',
      region_id: 'baku-region',
      sector_id: 'center-sector'
    },
    {
      id: '2', 
      name: 'Qafqaz Universitet Lisey Məktəbi',
      completion_rate: 45,
      status: 'active',
      last_updated: '2024-01-10',
      region_id: 'baku-region',
      sector_id: 'center-sector'
    },
    {
      id: '3',
      name: 'Nizami adına Məktəb',
      completion_rate: 92,
      status: 'active',
      last_updated: '2024-01-18',
      region_id: 'ganja-region',
      sector_id: 'north-sector'
    },
    {
      id: '4',
      name: 'Füzuli rayon məktəbi',
      completion_rate: 23,
      status: 'active',
      last_updated: '2024-01-05',
      region_id: 'fuzuli-region',
      sector_id: 'south-sector'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false);
  const [singleNotificationSchool, setSingleNotificationSchool] = useState<SchoolType | null>(null);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
      const matchesCompletion = 
        completionFilter === 'all' ||
        (completionFilter === 'high' && school.completion_rate >= 80) ||
        (completionFilter === 'medium' && school.completion_rate >= 40 && school.completion_rate < 80) ||
        (completionFilter === 'low' && school.completion_rate < 40);
      
      return matchesSearch && matchesStatus && matchesCompletion;
    });
  }, [schools, searchTerm, statusFilter, completionFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredSchools.length;
    const avgCompletion = total > 0 
      ? Math.round(filteredSchools.reduce((sum, school) => sum + school.completion_rate, 0) / total)
      : 0;
    const highCompletion = filteredSchools.filter(s => s.completion_rate >= 80).length;
    const lowCompletion = filteredSchools.filter(s => s.completion_rate < 40).length;
    
    return { total, avgCompletion, highCompletion, lowCompletion };
  }, [filteredSchools]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchools(filteredSchools.map(school => school.id));
    } else {
      setSelectedSchools([]);
    }
  };

  const handleSelectSchool = (schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchools([...selectedSchools, schoolId]);
    } else {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    }
  };

  // Navigation handlers
  const handleDataEntry = (schoolId: string) => {
    navigate(`/data-entry?schoolId=${schoolId}`);
  };

  const handleSchoolNameClick = (schoolId: string) => {
    handleDataEntry(schoolId);
  };

  // Notification handlers
  const handleBulkNotification = () => {
    if (selectedSchools.length === 0) {
      toast.error('Heç bir məktəb seçilməyib');
      return;
    }
    setIsBulkNotificationOpen(true);
  };

  const handleSingleNotification = (school: LocalSchool) => {
    const schoolType: SchoolType = {
      id: school.id,
      name: school.name,
      region_id: school.region_id,
      sector_id: school.sector_id,
      status: school.status
    };
    setSingleNotificationSchool(schoolType);
  };

  const sendBulkNotification = async (notificationData: any) => {
    setIsNotificationLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedSchools.length} məktəbə bildiriş göndərildi`);
      setSelectedSchools([]);
      if (onSendNotification) {
        onSendNotification(selectedSchools);
      }
    } catch (error) {
      toast.error('Bildiriş göndərilərkən xəta baş verdi');
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const sendSingleNotification = async (notificationData: any) => {
    setIsNotificationLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bildiriş uğurla göndərildi');
      if (onSendNotification) {
        onSendNotification([notificationData.schoolId]);
      }
    } catch (error) {
      toast.error('Bildiriş göndərilərkən xəta baş verdi');
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge className="bg-green-100 text-green-800 text-xs">Yüksək</Badge>;
    } else if (rate >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Orta</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 text-xs">Aşağı</Badge>;
    }
  };

  const selectedSchoolsForNotification = filteredSchools
    .filter(school => selectedSchools.includes(school.id))
    .map(school => ({
      id: school.id,
      name: school.name,
      region_id: school.region_id,
      sector_id: school.sector_id,
      status: school.status
    } as SchoolType));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sektor Admin - Məlumat Daxiletməsi</h1>
        <p className="text-muted-foreground">Məktəb məlumatlarını idarə edin və məlumat daxil edin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi məktəblər</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orta doldurma %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yüksək doldurma</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highCompletion}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aşağı doldurma</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowCompletion}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 space-y-2 sm:space-y-0 sm:flex sm:space-x-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Məktəb axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={completionFilter} onValueChange={setCompletionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün doldurma səviyyələri</SelectItem>
                  <SelectItem value="high">Yüksək (80%+)</SelectItem>
                  <SelectItem value="medium">Orta (40-79%)</SelectItem>
                  <SelectItem value="low">Aşağı (40%-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleBulkNotification}
                disabled={selectedSchools.length === 0}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Toplu bildiriş ({selectedSchools.length})</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                checked={selectedSchools.length === filteredSchools.length && filteredSchools.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Hamısını seç ({filteredSchools.length} məktəb)
              </span>
            </div>

            {/* Schools Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 w-12">Seç</th>
                    <th className="text-left p-2">Məktəb Adı</th>
                    <th className="text-left p-2 w-32">Doldurma</th>
                    <th className="text-left p-2 w-20">Status</th>
                    <th className="text-left p-2 w-48">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedSchools.includes(school.id)}
                          onCheckedChange={(checked) => handleSelectSchool(school.id, checked as boolean)}
                        />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleSchoolNameClick(school.id)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {school.name}
                          </button>
                          {school.last_updated && (
                            <p className="text-xs text-gray-500">
                              Son yeniləmə: {new Date(school.last_updated).toLocaleDateString('az')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{school.completion_rate}%</span>
                            {getCompletionBadge(school.completion_rate)}
                          </div>
                          <Progress value={school.completion_rate} className="w-20 h-2" />
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={school.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {school.status === 'active' ? 'Aktiv' : 'Passiv'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleDataEntry(school.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Məlumat daxil et
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSingleNotification(school)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Bildiriş
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/reports?schoolId=${school.id}`)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Hesabat
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSchools.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Heç bir məktəb tapılmadı</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Notification Dialog */}
      <BulkNotificationDialog
        isOpen={isBulkNotificationOpen}
        onClose={() => setIsBulkNotificationOpen(false)}
        selectedSchools={selectedSchoolsForNotification}
        onSend={sendBulkNotification}
        isLoading={isNotificationLoading}
      />

      {/* Single Notification Dialog */}
      {singleNotificationSchool && (
        <SingleNotificationDialog
          isOpen={!!singleNotificationSchool}
          onClose={() => setSingleNotificationSchool(null)}
          school={singleNotificationSchool}
          onSend={sendSingleNotification}
          isLoading={isNotificationLoading}
        />
      )}
    </div>
  );
};

export default EnhancedSectorAdminDataEntry;
