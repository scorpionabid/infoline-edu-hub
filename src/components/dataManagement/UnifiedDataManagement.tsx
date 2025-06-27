
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Database,
  Grid3X3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useDataManagement } from '@/hooks/dataManagement/useDataManagement';
import { CategorySelector } from './components/CategorySelector';
import { ColumnSelector } from './components/ColumnSelector';
import { SchoolDataGrid } from './components/SchoolDataGrid';
import { toast } from 'sonner';

/**
 * Unified Data Management Component
 * 
 * This component provides a unified interface for both data entry and approval
 * workflows. It adapts its behavior based on user role and selected data type.
 * 
 * Workflow Steps:
 * 1. Category Selection - Choose data category
 * 2. Column Selection - Choose specific column 
 * 3. Data Management - View/edit/approve school data
 * 
 * Features:
 * - Step-by-step workflow
 * - Role-based functionality
 * - Progressive disclosure
 * - Mobile responsive
 * - Error handling
 * - Compact mode for modal usage
 * - Preselected school filtering
 */

interface UnifiedDataManagementProps {
  preselectedSchoolId?: string; // Filter to show only specific school
  compactMode?: boolean; // Simplified layout for modals
}

const UnifiedDataManagement: React.FC<UnifiedDataManagementProps> = ({
  preselectedSchoolId,
  compactMode = false,
}) => {
  const { t } = useTranslation();
  
  // Use the unified data management hook
  const {
    // State
    currentStep,
    selectedCategory,
    selectedColumn,
    schoolData,
    stats,
    loading,
    error,
    permissions,
    
    // Navigation
    goToStep,
    resetWorkflow,
    
    // Category selection
    categories,
    handleCategorySelect,
    
    // Column selection  
    columns,
    handleColumnSelect,
    
    // Data management
    handleDataSave,
    handleDataApprove,
    handleDataReject,
    handleBulkApprove,
    handleBulkReject,
    
    // Utilities
    refreshData,
    // clearError
  } = useDataManagement();

  // Filter school data for preselected school
  const filteredSchoolData = preselectedSchoolId 
    ? schoolData.filter(school => school.school_id === preselectedSchoolId)
    : schoolData;

  // Calculate filtered stats
  const filteredStats = React.useMemo(() => {
    if (!preselectedSchoolId || !stats) return stats;
    
    const filteredData = schoolData.filter(school => school.school_id === preselectedSchoolId);
    if (filteredData.length === 0) return stats;
    
    const school = filteredData[0];
    return {
      totalSchools: 1,
      pendingCount: school.status === 'pending' ? 1 : 0,
      approvedCount: school.status === 'approved' ? 1 : 0,
      rejectedCount: school.status === 'rejected' ? 1 : 0,
      emptyCount: school.status === 'empty' ? 1 : 0,
      completionRate: school.status === 'approved' || school.status === 'pending' ? 100 : 0,
      totalEntries: stats.totalEntries,
      completedEntries: stats.completedEntries,
      pendingEntries: stats.pendingEntries
    };
  }, [preselectedSchoolId, stats, schoolData]);

  // Calculate progress
  const getProgress = () => {
    const steps = ['category', 'column', 'data'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Məlumatlar yeniləndi');
    } catch (error) {
      toast.error('Yeniləmə zamanı xəta baş verdi');
    }
  };

  // Error display
  if (error) {
    return (
      <div className="p-6">
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
    <div className={`${compactMode ? 'p-2 space-y-3' : 'p-3 sm:p-6 space-y-4 sm:space-y-6'}`}>
      {/* Header - Mobile Responsive */}
      {!compactMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Database className="h-5 w-5 sm:h-6 sm:w-6" />
              Data İdarəetməsi
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {currentStep === 'category' && 'Məlumat növünü seçin'}
              {currentStep === 'column' && 'Məlumat sütununu seçin'}
              {currentStep === 'data' && 'Məktəb məlumatlarını idarə edin'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep !== 'category' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => goToStep('category')}
                disabled={loading.categories || loading.columns}
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Başa qayıt</span>
                <span className="sm:hidden">Geri</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh} 
              disabled={loading.categories || loading.columns || loading.schoolData}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading.categories || loading.columns || loading.schoolData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yenilə</span>
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Gedişat</span>
          <span>{Math.round(getProgress())}%</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      {/* Step Indicators - Mobile Responsive */}
      <div className="flex items-center justify-center space-x-4 sm:space-x-8">
        <div className={`flex items-center gap-1 sm:gap-2 ${currentStep === 'category' ? 'text-blue-600' : currentStep === 'column' || currentStep === 'data' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'category' ? 'bg-blue-100 text-blue-600' : currentStep === 'column' || currentStep === 'data' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <span className="text-xs sm:text-sm font-medium">Kateqoriya</span>
        </div>
        
        <div className={`flex items-center gap-1 sm:gap-2 ${currentStep === 'column' ? 'text-blue-600' : currentStep === 'data' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'column' ? 'bg-blue-100 text-blue-600' : currentStep === 'data' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          <span className="text-xs sm:text-sm font-medium">Sütun</span>
        </div>
        
        <div className={`flex items-center gap-1 sm:gap-2 ${currentStep === 'data' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'data' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
            3
          </div>
          <span className="text-xs sm:text-sm font-medium">Məlumat</span>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedCategory || selectedColumn) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              {selectedCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seçilmiş Kateqoriya:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{selectedCategory.name}</span>
                    <Badge variant={selectedCategory.assignment === 'sectors' ? 'default' : 'secondary'}>
                      {selectedCategory.assignment === 'sectors' ? 'Sektor' : 'Məktəb'}
                    </Badge>
                  </div>
                </div>
              )}
              
              {selectedColumn && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Seçilmiş Sütun:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{selectedColumn.name}</span>
                      <Badge variant="outline">
                        {selectedColumn.type}
                      </Badge>
                      {selectedColumn.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Məcburi
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {currentStep === 'data' && filteredStats && (
        <div className={`grid grid-cols-1 ${compactMode ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-4`}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{filteredStats.totalSchools}</div>
              <div className="text-sm text-muted-foreground">Ümumi Məktəb</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{filteredStats.pendingCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Gözləyən
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredStats.approvedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Təsdiqlənmiş
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredStats.completionRate}%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Tamamlanma
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {currentStep === 'category' && (
          <CategorySelector
            categories={categories}
            loading={loading.categories}
            onCategorySelect={handleCategorySelect}
            permissions={permissions}
          />
        )}

        {currentStep === 'column' && selectedCategory && (
          <ColumnSelector
            category={selectedCategory}
            columns={columns}
            loading={loading.columns}
            onColumnSelect={handleColumnSelect}
            onBack={() => goToStep('category')}
          />
        )}

        {currentStep === 'data' && selectedColumn && (
          <SchoolDataGrid
            category={selectedCategory!}
            column={selectedColumn}
            schoolData={filteredSchoolData}
            stats={filteredStats}
            loading={loading.schoolData}
            saving={loading.saving}
            permissions={permissions}
            onDataSave={handleDataSave}
            onDataApprove={handleDataApprove}
            onDataReject={handleDataReject}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onBack={() => goToStep('column')}
            compactMode={compactMode}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedDataManagement;
