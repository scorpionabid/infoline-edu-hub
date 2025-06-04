
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataEntryFormManager } from './core';
import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
import { SchoolDataEntryManager } from './SchoolDataEntryManager';
import { 
  Search, 
  Edit, 
  Send,
  School,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  X
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
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface SchoolManagementProps {
  schools?: SchoolType[];
  isLoading?: boolean;
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  schools: propSchools,
  isLoading: propIsLoading = false,
  onDataEntry,
  onSendNotification
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);

  // Use either prop schools or fetch from API
  const { schools: hookSchools, loading: hookLoading } = useSchoolsQuery();
  
  // TEMPORARY TEST DATA - for debugging
  const testSchools = [
    {
      id: 'test-1',
      name: 'Test Məktəb 1',
      region_id: 'test-region',
      sector_id: user?.sector_id || 'test-sector',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completion_rate: 45,
      principal_name: 'Test Direktor 1',
      address: 'Test ünvan 1',
      phone: '+994501234567',
      email: 'school1@test.com'
    },
    {
      id: 'test-2',
      name: 'Test Məktəb 2',
      region_id: 'test-region',
      sector_id: user?.sector_id || 'test-sector',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completion_rate: 72,
      principal_name: 'Test Direktor 2',
      address: 'Test ünvan 2',
      phone: '+994501234568',
      email: 'school2@test.com'
    },
    {
      id: 'test-3',
      name: 'Test Məktəb 3',
      region_id: 'test-region',
      sector_id: user?.sector_id || 'test-sector',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completion_rate: 88,
      principal_name: 'Test Direktor 3',
      address: 'Test ünvan 3',
      phone: '+994501234569',
      email: 'school3@test.com'
    }
  ];
  
  // Use test data if no real data
  // For development: Always show test data if no real data available
  const schools = propSchools || hookSchools || testSchools;
  const isLoading = propIsLoading || hookLoading;

  // DEBUG: Console log for troubleshooting
  console.log('[SchoolManagement] Debug Info:', {
    user: user,
    userRole: user?.role,
    userSectorId: user?.sector_id,
    propSchools: propSchools,
    hookSchools: hookSchools,
    testSchools: testSchools,
    finalSchools: schools,
    schoolsLength: schools.length,
    isLoading: isLoading,
    hookLoading: hookLoading,
    usingTestData: !propSchools && !hookSchools
  });
  
  // Show warning if using test data
  const usingTestData = !propSchools && !hookSchools;
  if (usingTestData) {
    console.warn('[SchoolManagement] Using TEST DATA - not real database data!');
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false);
  const [singleNotificationSchool, setSingleNotificationSchool] = useState<SchoolType | null>(null);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  
  // YENİ: Modal states
  const [selectedSchoolForDataEntry, setSelectedSchoolForDataEntry] = useState<string | null>(null);
  const [isDataEntryModalOpen, setIsDataEntryModalOpen] = useState(false);

  // Calculate completion rate for schools
  const schoolsWithCompletion = useMemo(() => {
    console.log('[SchoolManagement] Processing schools for completion...', {
      inputSchools: schools,
      userSectorId: user?.sector_id,
      userRole: user?.role,
      schoolsSample: schools.slice(0, 3).map(s => ({
        id: s.id,
        name: s.name,
        sector_id: s.sector_id,
        region_id: s.region_id
      }))
    });
    
    // TEMPORARY FIX: Don't filter by sector for now to debug
    // Later we'll implement proper sector filtering
    let filteredSchools = schools;
    
    // DEBUG: Show sector comparison
    if (user?.role === 'sectoradmin' && user?.sector_id) {
      const matchingSchools = schools.filter(school => school.sector_id === user.sector_id);
      console.log('[SchoolManagement] Sector filtering debug:', {
        userSectorId: user.sector_id,
        totalSchools: schools.length,
        matchingSchools: matchingSchools.length,
        sampleSchoolSectors: schools.slice(0, 5).map(s => s.sector_id),
        allUniqueSectors: [...new Set(schools.map(s => s.sector_id))]
      });
      
      // For now, show all schools regardless of sector (for debugging)
      // filteredSchools = matchingSchools;
      filteredSchools = schools; // TEMPORARY: Show all
    }
    
    const result = filteredSchools.map(school => ({
      ...school,
      completion_rate: school.completion_rate || Math.floor(Math.random() * 100),
      last_updated: school.updated_at
    }));
    
    console.log('[SchoolManagement] Final schools with completion:', result.length, result.slice(0, 3));
    return result;
  }, [schools, user?.sector_id, user?.role]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    console.log('[SchoolManagement] Applying filters...', {
      schoolsWithCompletion: schoolsWithCompletion,
      searchTerm: searchTerm,
      statusFilter: statusFilter,
      completionFilter: completionFilter
    });
    
    const result = schoolsWithCompletion.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
      const matchesCompletion = 
        completionFilter === 'all' ||
        (completionFilter === 'high' && school.completion_rate >= 80) ||
        (completionFilter === 'medium' && school.completion_rate >= 40 && school.completion_rate < 80) ||
        (completionFilter === 'low' && school.completion_rate < 40);
      
      const matches = matchesSearch && matchesStatus && matchesCompletion;
      
      if (!matches) {
        console.log(`[SchoolManagement] School '${school.name}' filtered out:`, {
          matchesSearch,
          matchesStatus,
          matchesCompletion,
          school
        });
      }
      
      return matches;
    });
    
    console.log('[SchoolManagement] Final filtered schools:', result);
    return result;
  }, [schoolsWithCompletion, searchTerm, statusFilter, completionFilter]);

  // DEBUG: Modal state tracking
  useEffect(() => {
    console.log('[SchoolManagement] Modal state changed:', {
      selectedSchoolForDataEntry,
      isDataEntryModalOpen,
      selectedSchool: selectedSchoolForDataEntry 
        ? filteredSchools.find(s => s.id === selectedSchoolForDataEntry)
        : null
    });
  }, [selectedSchoolForDataEntry, isDataEntryModalOpen, filteredSchools]);

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
    console.log('[SchoolManagement] handleDataEntry called with schoolId:', schoolId);
    
    if (onDataEntry) {
      console.log('[SchoolManagement] Calling onDataEntry prop');
      onDataEntry(schoolId);
    } else {
      console.log('[SchoolManagement] Opening modal for schoolId:', schoolId);
      // Modal açma
      setSelectedSchoolForDataEntry(schoolId);
      setIsDataEntryModalOpen(true);
      
      console.log('[SchoolManagement] Modal state updated:', {
        selectedSchoolForDataEntry: schoolId,
        isDataEntryModalOpen: true
      });
    }
  };

  // YENİ: Modal completion handler
  const handleDataEntryComplete = () => {
    setIsDataEntryModalOpen(false);
    setSelectedSchoolForDataEntry(null);
    toast.success('Məlumatlar uğurla saxlanıldı');
    // Reload school data if needed
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

  const handleSingleNotification = (school: SchoolType) => {
    setSingleNotificationSchool(school);
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

  // YENİ: Selected school info
  const selectedSchool = useMemo(() => {
    return selectedSchoolForDataEntry 
      ? filteredSchools.find(s => s.id === selectedSchoolForDataEntry)
      : null;
  }, [selectedSchoolForDataEntry, filteredSchools]);

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge className="bg-green-100 text-green-800 text-xs">Yüksək</Badge>;
    } else if (rate >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Orta</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 text-xs">Aşağı</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>{t('loadingSchools')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                          {/* TEST MODAL BUTTON - Fixed UUID */}
                          <Button
                            onClick={() => {
                              console.log('[SchoolManagement] TEST button clicked for school:', school.id);
                              // Use actual school ID instead of concatenating
                              setSelectedSchoolForDataEntry(school.id);
                              setIsDataEntryModalOpen(true);
                              console.log('[SchoolManagement] Modal opened for school ID:', school.id);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                          >
                            TEST
                          </Button>
                          
                          <Button
                            onClick={() => {
                              console.log('[SchoolManagement] Button clicked for school:', school.id, school.name);
                              handleDataEntry(school.id);
                            }}
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
        selectedSchools={filteredSchools.filter(school => selectedSchools.includes(school.id))}
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

      {/* YENİ: Data Entry Modal - Tab üslubunda */}
      {console.log('[SchoolManagement] Rendering modal with state:', {
        isDataEntryModalOpen,
        selectedSchoolForDataEntry,
        selectedSchool
      })}
      <Dialog open={isDataEntryModalOpen} onOpenChange={setIsDataEntryModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {selectedSchool && `${selectedSchool.name} üçün məlumat daxil etmə`}
                {!selectedSchool && 'Məlumat daxil etmə'}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  console.log('[SchoolManagement] Modal close button clicked');
                  setIsDataEntryModalOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Sektor administratoru olaraq daxil etdiyiniz məlumatlar avtomatik təsdiqlənəcək.
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {selectedSchoolForDataEntry ? (
              <SchoolDataEntryManager
                schoolId={selectedSchoolForDataEntry}
                onComplete={handleDataEntryComplete}
                onClose={() => setIsDataEntryModalOpen(false)}
              />
            ) : (
              <div className="p-4 text-center">
                <p>Heç bir məktəb seçilməyib</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement;
