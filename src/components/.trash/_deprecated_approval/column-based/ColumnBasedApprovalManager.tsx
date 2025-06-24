import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertCircle, 
  Grid3X3, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useColumnBasedApproval } from '@/hooks/approval/useColumnBasedApproval';
import { ColumnSelector } from './ColumnSelector';
import { SchoolDataTable } from './SchoolDataTable';
import { ColumnInfo } from '@/types/columnBasedApproval';
import { toast } from 'sonner';

interface ColumnBasedApprovalManagerProps {
  autoLoadCategories?: boolean;
  autoLoadColumns?: boolean;
  defaultCategoryId?: string;
  defaultColumnId?: string;
  className?: string;
}

export const ColumnBasedApprovalManager: React.FC<ColumnBasedApprovalManagerProps> = ({
  autoLoadCategories = true,
  autoLoadColumns = true,
  defaultCategoryId,
  defaultColumnId,
  className
}) => {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(defaultCategoryId || null);
  
  // Use column-based approval hook
  const {
    // Data
    categories,
    columns,
    selectedColumnId,
    selectedColumn,
    schoolData,
    filteredData,
    filter,
    stats,
    
    // Loading states
    isLoadingCategories,
    isLoadingColumns,
    isLoadingData,
    isProcessing,
    
    // Error state
    error,
    
    // Selection
    selectedSchoolIds,
    
    // Actions
    loadCategories,
    loadColumns,
    selectColumn,
    refreshData,
    updateFilter,
    resetFilter,
    approveEntry,
    rejectEntry,
    bulkApprove,
    bulkReject,
    selectSchool,
    selectAll,
    selectNone,
    selectPending,
    clearError,
    resetState
  } = useColumnBasedApproval({
    autoLoadCategories,
    autoLoadColumns,
    defaultCategoryId,
    defaultColumnId
  });

  // Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    console.log('[ColumnBasedApprovalManager] Category selected:', categoryId);
    setSelectedCategoryId(categoryId);
    await loadColumns(categoryId);
  };

  // Handle column selection
  const handleColumnSelect = async (columnId: string) => {
    console.log('[ColumnBasedApprovalManager] Column selected:', columnId);
    await selectColumn(columnId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      if (selectedColumnId) {
        await refreshData();
        toast.success('Məlumatlar yeniləndi');
      } else {
        await loadCategories();
        toast.success('Kateqoriyalar yeniləndi');
      }
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast.error('Yeniləmə zamanı xəta');
    }
  };

  // Handle individual approval with user confirmation
  const handleApproveEntry = async (schoolId: string, comment?: string): Promise<boolean> => {
    const schoolEntry = schoolData.find(s => s.schoolId === schoolId);
    if (!schoolEntry) {
      toast.error('Məktəb tapılmadı');
      return false;
    }

    const confirmed = window.confirm(
      `"${schoolEntry.schoolName}" məktəbinin məlumatını təsdiqləmək istəyirsiniz?`
    );
    
    if (!confirmed) return false;

    return await approveEntry(schoolId, comment);
  };

  // Handle individual rejection with user input
  const handleRejectEntry = async (schoolId: string, defaultReason?: string): Promise<boolean> => {
    const schoolEntry = schoolData.find(s => s.schoolId === schoolId);
    if (!schoolEntry) {
      toast.error('Məktəb tapılmadı');
      return false;
    }

    const reason = window.prompt(
      `"${schoolEntry.schoolName}" məktəbinin məlumatını rədd etmə səbəbi:`,
      defaultReason || 'Məlumat düzgün deyil'
    );
    
    if (!reason || reason.trim() === '') {
      toast.warning('Rədd səbəbi daxil edilmədi');
      return false;
    }

    const comment = window.prompt(
      'Əlavə şərh (ixtiyari):',
      ''
    );

    return await rejectEntry(schoolId, reason, comment || undefined);
  };

  // Error display with action
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearError}>
                Bağla
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenidən cəhd et
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-6 w-6" />
            Sütun-əsaslı Təsdiq Sistemi
          </h1>
          <p className="text-muted-foreground mt-1">
            Sütun seçib məktəblərin məlumatlarını təsdiq edin
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilter} disabled={isLoadingData}>
            Filtri sıfırla
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoadingData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Yenilə
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {selectedColumn && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <div className="text-sm text-muted-foreground">Ümumi Məktəb</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Gözləyən
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Təsdiqlənmiş
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <XCircle className="h-3 w-3" />
                Rədd edilmiş
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Column Selector */}
      <ColumnSelector
        categories={categories}
        columns={columns}
        selectedColumnId={selectedColumnId}
        selectedCategoryId={selectedCategoryId}
        isLoadingCategories={isLoadingCategories}
        isLoadingColumns={isLoadingColumns}
        onCategorySelect={handleCategorySelect}
        onColumnSelect={handleColumnSelect}
      />

      {/* Selected Column Info */}
      {selectedColumn && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-lg">
                  Seçilmiş sütun: {selectedColumn.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Kateqoriya: {selectedColumn.categoryName} • 
                  Tip: {selectedColumn.type} • 
                  {selectedColumn.isRequired ? 'Məcburi' : 'İxtiyari'}
                </div>
                {selectedColumn.helpText && (
                  <div className="text-sm text-blue-700 mt-1">
                    💡 {selectedColumn.helpText}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">Tamamlanma</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.completionRate}%
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Data Table */}
      {selectedColumnId && (
        <SchoolDataTable
          schoolData={filteredData}
          stats={stats}
          filter={filter}
          selectedSchoolIds={selectedSchoolIds}
          isLoadingData={isLoadingData}
          isProcessing={isProcessing}
          onFilterUpdate={updateFilter}
          onSchoolSelect={selectSchool}
          onSelectAll={selectAll}
          onSelectNone={selectNone}
          onSelectPending={selectPending}
          onApproveEntry={handleApproveEntry}
          onRejectEntry={handleRejectEntry}
          onBulkApprove={bulkApprove}
          onBulkReject={bulkReject}
        />
      )}

      {/* Empty State */}
      {!selectedColumnId && !isLoadingCategories && !isLoadingColumns && (
        <Card>
          <CardContent className="p-8 text-center">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Sütun seçin</p>
            <p className="text-sm text-muted-foreground">
              Təsdiq prosesini başlatmaq üçün yuxarıdan kateqoriya və sütun seçin
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(isLoadingCategories || isLoadingColumns) && !selectedColumnId && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Yüklənir...</p>
            <p className="text-sm text-muted-foreground">
              {isLoadingCategories ? 'Kateqoriyalar yüklənir' : 'Sütunlar yüklənir'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColumnBasedApprovalManager;
