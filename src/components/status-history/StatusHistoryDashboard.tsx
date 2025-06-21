import React, { useState } from 'react';
import { useStatusStatistics, useFilteredStatusHistory } from '@/hooks/useStatusHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import StatusHistoryTable from './StatusHistoryTable';
import { BarChart3, TrendingUp, Clock, Filter, Calendar } from 'lucide-react';

/**
 * Status History Dashboard Component
 * 
 * Bu komponent status dəyişikliklərinin ümumi statistikasını və
 * filter edilmiş tarixçəsini göstərir.
 */

interface StatusHistoryDashboardProps {
  className?: string;
}

export const StatusHistoryDashboard: React.FC<StatusHistoryDashboardProps> = ({
  className = ''
}) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    userId: '',
    entryId: ''
  });

  const { statistics, loading: statsLoading, error: statsError } = useStatusStatistics();
  const { 
    history: filteredHistory, 
    loading: historyLoading, 
    refetch: refetchHistory 
  } = useFilteredStatusHistory(filters);

  /**
   * Filter dəyişikliyi
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Filter sıfırlama
   */
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      userId: '',
      entryId: ''
    });
  };

  /**
   * Statistics Card Component
   */
  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = 'text-blue-600' }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <Card className="col-span-full">
            <CardContent className="p-4 text-center text-red-600">
              <p>Statistika yüklənmədi: {statsError}</p>
            </CardContent>
          </Card>
        ) : statistics ? (
          <>
            <StatCard
              title="Toplam Dəyişiklik"
              value={statistics.totalTransitions || 0}
              icon={<BarChart3 className="h-6 w-6" />}
              color="text-blue-600"
            />
            <StatCard
              title="Bu Gün"
              value={statistics.todayTransitions || 0}
              icon={<TrendingUp className="h-6 w-6" />}
              color="text-green-600"
            />
            <StatCard
              title="Bu Həftə"
              value={statistics.weeklyTransitions || 0}
              icon={<Clock className="h-6 w-6" />}
              color="text-orange-600"
            />
            <StatCard
              title="Aktiv Status"
              value={Object.keys(statistics.statusCounts || {}).length}
              icon={<Badge className="h-6 w-6" />}
              color="text-purple-600"
            />
          </>
        ) : null}
      </div>

      {/* Status Distribution */}
      {statistics?.statusCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Status Paylanması</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.statusCounts).map(([status, count]) => (
                <div key={status} className="text-center p-3 border rounded-lg">
                  <p className="font-semibold text-lg">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter və Axtarış</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlama Tarixi</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş Tarixi</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Hamısı</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Entry ID</label>
              <Input
                type="text"
                placeholder="Entry ID daxil edin"
                value={filters.entryId}
                onChange={(e) => handleFilterChange('entryId', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <Input
                type="text"
                placeholder="User ID daxil edin"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Filtri Təmizlə
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtered History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filter Edilmiş Tarixçə</span>
            </div>
            {filteredHistory.length > 0 && (
              <Badge variant="secondary">
                {filteredHistory.length} nəticə
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Seçilmiş filterlərə uyğun nəticə tapılmadı</p>
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Filtri Təmizlə
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {filteredHistory.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Status Transition */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">
                          {entry.old_status}
                        </Badge>
                        <span className="text-gray-400">→</span>
                        <Badge variant="default">
                          {entry.new_status}
                        </Badge>
                      </div>
                      
                      {/* Entry ID */}
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Entry:</strong> {entry.data_entry_id}
                      </div>
                      
                      {/* Comment */}
                      {entry.comment && (
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Şərh:</strong> {entry.comment}
                        </div>
                      )}
                      
                      {/* Changed By */}
                      <div className="text-sm text-gray-500">
                        <strong>Dəyişdirən:</strong> {entry.changed_by_name}
                        {entry.changed_by_email && (
                          <span className="text-xs ml-1">({entry.changed_by_email})</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="text-right text-sm text-gray-500 flex-shrink-0 ml-4">
                      <div>{new Date(entry.changed_at).toLocaleDateString('az-AZ')}</div>
                      <div className="text-xs">
                        {new Date(entry.changed_at).toLocaleTimeString('az-AZ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <StatusHistoryTable
        maxHeight="500px"
        showActions={true}
        autoRefresh={true}
        limit={20}
        className=""
      />
    </div>
  );
};

export default StatusHistoryDashboard;
