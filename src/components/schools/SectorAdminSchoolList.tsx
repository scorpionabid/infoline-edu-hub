
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useSchoolManagement } from '@/hooks/dataEntry/useSchoolManagement';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SchoolDataEntryManager } from '@/components/dataEntry/SchoolDataEntryManager';
import { 
  School, 
  Search, 
  MapPin, 
  Users, 
  BookOpen, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  FileText,
  Filter
} from 'lucide-react';

export const SectorAdminSchoolList: React.FC = () => {
  const user = useAuthStore(selectUser);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const {
    schools,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedSchools,
    handleSelectAll,
    handleSelectSchool,
    handleDataEntry,
    handleDataEntryComplete,
    selectedSchoolForDataEntry,
    isDataEntryModalOpen,
    setIsDataEntryModalOpen,
    handleBulkNotification,
    isBulkNotificationOpen,
    setIsBulkNotificationOpen,
    isNotificationLoading,
    sendBulkNotification,
    getCompletionBadge
  } = useSchoolManagement({
    sectorId: user?.sector_id,
    onDataEntry: (schoolId) => {
      console.log('Opening data entry for school:', schoolId);
    }
  });

  const filteredSchools = schools.filter(school => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'high' && school.completion_rate >= 80) return true;
    if (statusFilter === 'medium' && school.completion_rate >= 40 && school.completion_rate < 80) return true;
    if (statusFilter === 'low' && school.completion_rate < 40) return true;
    return false;
  });

  const allSelected = selectedSchools.length === filteredSchools.length && filteredSchools.length > 0;
  const someSelected = selectedSchools.length > 0 && selectedSchools.length < filteredSchools.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Məktəblər yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ümumi Məktəblər</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <School className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orta Tamamlanma</p>
                <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
              </div>
              <Progress value={stats.avgCompletion} className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yüksək Performans</p>
                <p className="text-2xl font-bold">{stats.highCompletion}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aşağı Performans</p>
                <p className="text-2xl font-bold">{stats.lowCompletion}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Axtarış və Filtr
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Məktəb adı ilə axtarın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Hamısı ({schools.length})
              </Button>
              <Button
                variant={statusFilter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('high')}
              >
                Yüksək ({stats.highCompletion})
              </Button>
              <Button
                variant={statusFilter === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('medium')}
              >
                Orta ({stats.total - stats.highCompletion - stats.lowCompletion})
              </Button>
              <Button
                variant={statusFilter === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('low')}
              >
                Aşağı ({stats.lowCompletion})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSchools.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedSchools.length} məktəb seçilib</Badge>
                <span className="text-sm text-muted-foreground">
                  Seçilmiş məktəblər üçün toplu əməliyyat
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkNotification}
                  disabled={isNotificationLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isNotificationLoading ? 'Göndərilir...' : 'Bildiriş Göndər'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schools List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Sektor Məktəbləri ({filteredSchools.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
              />
              <span className="text-sm text-muted-foreground">Hamısını seç</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSchools.map((school) => {
              const completionBadge = getCompletionBadge(school.completion_rate);
              
              return (
                <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedSchools.includes(school.id)}
                        onCheckedChange={(checked) => handleSelectSchool(school.id, !!checked)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 
                            className="font-semibold text-lg cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => handleDataEntry(school.id)}
                          >
                            {school.name}
                          </h3>
                          <Badge 
                            className={completionBadge.className}
                            variant={completionBadge.variant as any}
                          >
                            {completionBadge.text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {school.address || 'Ünvan məlumatı yoxdur'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {school.student_count || 0} şagird
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Müdir: {school.principal_name || 'Məlumat yoxdur'}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Tamamlanma dərəcəsi:</span>
                            <span className="text-sm">{school.completion_rate}%</span>
                          </div>
                          <Progress value={school.completion_rate} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDataEntry(school.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Məlumat Daxil Et
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredSchools.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seçilmiş filterlərə uyğun məktəb tapılmadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Modal */}
      {isDataEntryModalOpen && selectedSchoolForDataEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                Məlumat Daxil Etmə - {schools.find(s => s.id === selectedSchoolForDataEntry)?.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDataEntryModalOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <SchoolDataEntryManager
                schoolId={selectedSchoolForDataEntry}
                onComplete={handleDataEntryComplete}
                onClose={() => setIsDataEntryModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {isBulkNotificationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Toplu Bildiriş Göndər</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBulkNotificationOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedSchools.length} məktəbə bildiriş göndəriləcək
                  </p>
                  <textarea
                    placeholder="Bildiriş mətni..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsBulkNotificationOpen(false)}
                  >
                    Ləğv et
                  </Button>
                  <Button
                    onClick={() => sendBulkNotification({ message: 'Test notification' })}
                    disabled={isNotificationLoading}
                  >
                    {isNotificationLoading ? 'Göndərilir...' : 'Göndər'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorAdminSchoolList;
