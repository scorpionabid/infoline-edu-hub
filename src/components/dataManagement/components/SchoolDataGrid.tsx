import React, { useState, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft,
  School,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
  Download,
  Users,
  Search
} from 'lucide-react';
import { Category, Column, SchoolDataEntry, DataStats } from '@/hooks/dataManagement/useDataManagement';
import { DataActions } from './DataActions';

interface SchoolDataGridProps {
  category: Category;
  column: Column;
  schoolData: SchoolDataEntry[];
  stats: DataStats | null;
  loading: boolean;
  saving: boolean;
  permissions: {
    canApprove: boolean;
    canEdit: boolean;
    canViewAll: boolean;
    role: string;
    sectorId?: string;
    regionId?: string;
  };
  onDataSave: (schoolId: string, value: string) => Promise<boolean>;
  onDataApprove: (schoolId: string, comment?: string) => Promise<boolean>;
  onDataReject: (schoolId: string, reason: string, comment?: string) => Promise<boolean>;
  onBulkApprove: (schoolIds: string[]) => Promise<boolean>;
  onBulkReject: (schoolIds: string[], reason: string) => Promise<boolean>;
  onBack: () => void;
}

type FilterStatus = 'all' | 'empty' | 'pending' | 'approved' | 'rejected';

/**
 * School Data Grid Component
 * 
 * Displays school data in a table format with inline editing capabilities
 * and approval/rejection actions. Supports bulk operations and filtering.
 * 
 * Features:
 * - Inline data editing
 * - Individual and bulk approval/rejection
 * - Status filtering
 * - Progress tracking
 * - Export functionality
 */
export const SchoolDataGrid: React.FC<SchoolDataGridProps> = ({
  category,
  column,
  schoolData,
  stats,
  loading,
  saving,
  permissions,
  onDataSave,
  onDataApprove,
  onDataReject,
  onBulkApprove,
  onBulkReject,
  onBack
}) => {
  // Local state for editing and selection
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({});
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = schoolData;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(school => school.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(school => 
        school.schoolName.toLowerCase().includes(term) ||
        school.sectorName.toLowerCase().includes(term) ||
        school.regionName.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [schoolData, statusFilter, searchTerm]);

  // Handle value change for inline editing - Memoized
  const handleValueChange = useCallback((schoolId: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [schoolId]: value
    }));
  }, []);

  // Handle individual save
  const handleSave = async (schoolId: string) => {
    const value = editingValues[schoolId];
    if (value === undefined) return;

    const success = await onDataSave(schoolId, value);
    if (success) {
      // Clear editing value
      setEditingValues(prev => {
        const updated = { ...prev };
        delete updated[schoolId];
        return updated;
      });
    }
  };

  // Handle bulk save
  const handleBulkSave = async () => {
    const entries = Object.entries(editingValues).filter(([_, value]) => value?.trim());
    if (entries.length === 0) return;

    let successCount = 0;
    for (const [schoolId, value] of entries) {
      const success = await onDataSave(schoolId, value);
      if (success) successCount++;
    }

    if (successCount > 0) {
      // Clear successful edits
      setEditingValues({});
    }
  };

  // Selection handlers
  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleSelectAll = () => {
    const selectableSchools = filteredData
      .filter(school => school.canApprove || school.canEdit)
      .map(school => school.schoolId);
    
    setSelectedSchools(prev => 
      prev.length === selectableSchools.length ? [] : selectableSchools
    );
  };

  // Render input field based on column type
  const renderInputField = (school: SchoolDataEntry) => {
    const currentValue = editingValues[school.schoolId] ?? school.currentValue ?? '';
    const isDisabled = !school.canEdit || saving;

    if (!school.canEdit) {
      return (
        <span className="text-muted-foreground">
          {school.currentValue || '-'}
        </span>
      );
    }

    if (column.type === 'textarea') {
      return (
        <Textarea
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={currentValue}
          onChange={(e) => handleValueChange(school.schoolId, e.target.value)}
          disabled={isDisabled}
          rows={2}
          className="min-w-[200px]"
        />
      );
    } else if (column.type === 'select' && column.options) {
      return (
        <Select 
          value={currentValue} 
          onValueChange={(value) => handleValueChange(school.schoolId, value)}
          disabled={isDisabled}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="Seçim edin..." />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option: any) => (
              <SelectItem key={option.value || option} value={option.value || option}>
                {option.label || option.value || option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type={column.type === 'number' ? 'number' : 'text'}
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={currentValue}
          onChange={(e) => handleValueChange(school.schoolId, e.target.value)}
          disabled={isDisabled}
          className="min-w-[200px]"
        />
      );
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Təsdiqlənmiş' },
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Gözləyir' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rədd edilmiş' },
      empty: { variant: 'outline' as const, icon: AlertCircle, text: 'Boş' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h3 className="text-2xl font-bold">Məktəb Məlumatları</h3>
            <p className="text-muted-foreground">Məlumatlar yüklənir...</p>
          </div>
        </div>

        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Məktəb məlumatları yüklənir...</h3>
          <p className="text-muted-foreground">
            {column.name} sütunu üçün məlumatlar hazırlanır
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <School className="h-6 w-6" />
            Məktəb Məlumatları
          </h3>
          <p className="text-muted-foreground">
            {column.name} sütunu üçün məlumatları idarə edin
          </p>
        </div>
      </div>

      {/* Column Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-lg">{column.name}</div>
              <div className="text-sm text-muted-foreground">
                Kateqoriya: {category.name} • Tip: {column.type}
                {column.is_required && ' • Məcburi'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {column.is_required && (
                <Badge variant="destructive">Məcburi</Badge>
              )}
              <Badge variant="outline">{column.type}</Badge>
            </div>
          </div>
          {column.help_text && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{column.help_text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Məktəb axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: FilterStatus) => setStatusFilter(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün statuslar</SelectItem>
              <SelectItem value="empty">Boş</SelectItem>
              <SelectItem value="pending">Gözləyən</SelectItem>
              <SelectItem value="approved">Təsdiqlənmiş</SelectItem>
              <SelectItem value="rejected">Rədd edilmiş</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(editingValues).length > 0 && (
            <Button 
              onClick={handleBulkSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Hamısını Saxla ({Object.keys(editingValues).length})
            </Button>
          )}
          
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            İxrac Et
          </Button>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedSchools.length > 0 && permissions.canApprove && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {selectedSchools.length} məktəb seçilib
                </span>
              </div>
              
              <DataActions
                selectedSchools={selectedSchools}
                onBulkApprove={onBulkApprove}
                onBulkReject={onBulkReject}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Məktəb tapılmadı</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Filtr şərtlərinə uyğun məktəb tapılmadı'
              : 'Bu sütun üçün heç bir məktəb məlumatı tapılmadı'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Filtirləri sıfırla
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {permissions.canApprove && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedSchools.length === filteredData.filter(s => s.canApprove || s.canEdit).length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Məktəb</TableHead>
                  <TableHead>Mövcud Dəyər</TableHead>
                  <TableHead>Yeni Dəyər</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((school) => (
                  <TableRow key={school.schoolId}>
                    {permissions.canApprove && (
                      <TableCell>
                        {(school.canApprove || school.canEdit) && (
                          <Checkbox
                            checked={selectedSchools.includes(school.schoolId)}
                            onCheckedChange={() => handleSelectSchool(school.schoolId)}
                          />
                        )}
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{school.schoolName}</div>
                        <div className="text-sm text-muted-foreground">
                          {school.sectorName}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {school.currentValue ? (
                        <span className="font-medium">{school.currentValue}</span>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Boş
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {renderInputField(school)}
                    </TableCell>
                    
                    <TableCell>
                      {renderStatusBadge(school.status)}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {school.canEdit && editingValues[school.schoolId] !== undefined && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(school.schoolId)}
                            disabled={saving || !editingValues[school.schoolId]?.trim()}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Saxla
                          </Button>
                        )}
                        
                        {school.canApprove && school.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onDataApprove(school.schoolId)}
                              disabled={saving}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Təsdiqlə
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = window.prompt('Rədd səbəbi:');
                                if (reason) onDataReject(school.schoolId, reason);
                              }}
                              disabled={saving}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Rədd et
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
            <span>
              {filteredData.length} məktəb göstərilir
              {statusFilter !== 'all' && ` • Filtr: ${statusFilter}`}
              {searchTerm && ` • Axtarış: "${searchTerm}"`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};