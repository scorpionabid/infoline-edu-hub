import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  AlertTriangle,
  School,
  Users,
  Loader2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { SchoolDataEntry, ColumnBasedFilter, ColumnBasedStats } from '@/types/columnBasedApproval';
import { DataEntryStatus } from '@/types/dataEntry';
import { useTranslation } from '@/contexts/TranslationContext';
import { ApprovalActions } from './ApprovalActions';

interface SchoolDataTableProps {
  schoolData: SchoolDataEntry[];
  stats: ColumnBasedStats;
  filter: ColumnBasedFilter;
  selectedSchoolIds: string[];
  isLoadingData: boolean;
  isProcessing: boolean;
  onFilterUpdate: (filter: Partial<ColumnBasedFilter>) => void;
  onSchoolSelect: (schoolId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectPending: () => void;
  onApproveEntry: (schoolId: string, comment?: string) => Promise<boolean>;
  onRejectEntry: (schoolId: string, reason: string, comment?: string) => Promise<boolean>;
  onBulkApprove: (schoolIds: string[], comment?: string) => Promise<any>;
  onBulkReject: (schoolIds: string[], reason: string, comment?: string) => Promise<any>;
  className?: string;
}

export const SchoolDataTable: React.FC<SchoolDataTableProps> = ({
  schoolData,
  stats,
  filter,
  selectedSchoolIds,
  isLoadingData,
  isProcessing,
  onFilterUpdate,
  onSchoolSelect,
  onSelectAll,
  onSelectNone,
  onSelectPending,
  onApproveEntry,
  onRejectEntry,
  onBulkApprove,
  onBulkReject,
  className
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(filter.searchTerm || '');
  const [showApprovalActions, setShowApprovalActions] = useState(false);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onFilterUpdate({ searchTerm: term || undefined });
  };

  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    onFilterUpdate({ 
      status: status === 'all' ? 'all' : status as DataEntryStatus 
    });
  };

  const handleShowEmptyToggle = (checked: boolean) => {
    onFilterUpdate({ showEmptyValues: checked });
  };

  const handleShowOnlyPendingToggle = (checked: boolean) => {
    onFilterUpdate({ showOnlyPending: checked });
  };

  // Get status badge
  const getStatusBadge = (status: DataEntryStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Gözləyən
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Təsdiqlənmiş
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rədd edilmiş
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Naməlum
          </Badge>
        );
    }
  };

  // Get value display
  const getValueDisplay = (entry: SchoolDataEntry) => {
    if (!entry.value || entry.value.trim() === '') {
      return (
        <span className="text-muted-foreground italic">Boş</span>
      );
    }
    return (
      <span className="font-medium">{entry.formattedValue}</span>
    );
  };

  // Check if all visible items are selected
  const selectableItems = schoolData.filter(item => item.canApprove);
  const isAllSelected = selectableItems.length > 0 && 
    selectableItems.every(item => selectedSchoolIds.includes(item.schoolId));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectNone();
    } else {
      onSelectAll();
    }
  };

  if (isLoadingData) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Məktəb məlumatları yüklənir...</p>
          <p className="text-sm text-muted-foreground">
            Zəhmət olmasa gözləyin
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <div className="text-sm text-muted-foreground">Ümumi məktəb</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
            <div className="text-sm text-muted-foreground">Gözləyən</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
            <div className="text-sm text-muted-foreground">Təsdiqlənmiş</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Tamamlanma</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrlər və Axtarış
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Məktəb adı, sektor və ya dəyərə görə axtarın..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filter.status || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün statuslar</SelectItem>
                  <SelectItem value="pending">Gözləyən</SelectItem>
                  <SelectItem value="approved">Təsdiqlənmiş</SelectItem>
                  <SelectItem value="rejected">Rədd edilmiş</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showEmpty"
                  checked={filter.showEmptyValues || false}
                  onCheckedChange={handleShowEmptyToggle}
                />
                <label htmlFor="showEmpty" className="text-sm font-medium">
                  Boş dəyərləri göstər
                </label>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showPending"
                  checked={filter.showOnlyPending || false}
                  onCheckedChange={handleShowOnlyPendingToggle}
                />
                <label htmlFor="showPending" className="text-sm font-medium">
                  Yalnız gözləyənlər
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSchoolIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedSchoolIds.length} məktəb seçildi
                </span>
                <Button variant="outline" size="sm" onClick={onSelectNone}>
                  Seçimi ləğv et
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowApprovalActions(!showApprovalActions)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showApprovalActions ? 'Sadə görünüş' : 'Əməliyyatlar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Actions Panel */}
      {selectedSchoolIds.length > 0 && showApprovalActions && (
        <ApprovalActions
          selectedCount={selectedSchoolIds.length}
          isProcessing={isProcessing}
          onBulkApprove={(comment) => onBulkApprove(selectedSchoolIds, comment)}
          onBulkReject={(reason, comment) => onBulkReject(selectedSchoolIds, reason, comment)}
          onCancel={() => {
            setShowApprovalActions(false);
            onSelectNone();
          }}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Məktəb Məlumatları ({schoolData.length})</span>
            {selectableItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onSelectPending}>
                  Gözləyənləri seç
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {isAllSelected ? 'Heç birini seçmə' : 'Hamısını seç'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schoolData.length === 0 ? (
            <div className="text-center py-8">
              <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Məlumat tapılmadı</p>
              <p className="text-sm text-muted-foreground">
                Filtrlər və ya axtarış şərtlərini dəyişməyi sınayın
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectableItems.length > 0 && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Məktəb</TableHead>
                    <TableHead>Sektor</TableHead>
                    <TableHead>Dəyər</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tarix</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.map((entry) => {
                    const isSelected = selectedSchoolIds.includes(entry.schoolId);
                    
                    return (
                      <TableRow 
                        key={entry.schoolId}
                        className={`
                          ${entry.status === 'rejected' ? 'bg-red-50' : ''}
                          ${isSelected ? 'bg-blue-50' : ''}
                        `}
                      >
                        {selectableItems.length > 0 && (
                          <TableCell>
                            {entry.canApprove && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  onSchoolSelect(entry.schoolId, !!checked)
                                }
                              />
                            )}
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.schoolName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {entry.schoolId.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.sectorName}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.regionName}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getValueDisplay(entry)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(entry.status)}
                            {entry.rejectionReason && (
                              <div className="text-xs text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {entry.rejectionReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {entry.submittedAt && (
                              <div>
                                Təqdim: {new Date(entry.submittedAt).toLocaleDateString('az-AZ')}
                              </div>
                            )}
                            {entry.approvedAt && (
                              <div className="text-green-600">
                                Təsdiq: {new Date(entry.approvedAt).toLocaleDateString('az-AZ')}
                              </div>
                            )}
                            {entry.rejectedAt && (
                              <div className="text-red-600">
                                Rədd: {new Date(entry.rejectedAt).toLocaleDateString('az-AZ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {entry.canApprove && (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                onClick={() => onApproveEntry(entry.schoolId)}
                                disabled={isProcessing}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Təsdiq
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onRejectEntry(entry.schoolId, 'Məlumat düzgün deyil')}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rədd
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolDataTable;
