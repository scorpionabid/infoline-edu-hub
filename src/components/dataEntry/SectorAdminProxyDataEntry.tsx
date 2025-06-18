import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useProxyDataEntry } from './hooks/useProxyDataEntry';
import { ProxyDataEntryHeader, ProxyFormActions, ProxyNotificationStatus } from './proxy';
import { FormFields } from './core';
import { AutoSaveIndicator } from './core';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SectorAdminProxyDataEntryProps {
  schoolId: string;
  categoryId: string;
  columnId?: string;
  onClose?: () => void;
  onComplete?: () => void;
}

const SectorAdminProxyDataEntry: React.FC<SectorAdminProxyDataEntryProps> = ({
  schoolId,
  categoryId,
  columnId,
  onClose,
  onComplete
}) => {
  const {
    // Data
    schoolData,
    categoryData,
    columns,
    formData,
    
    // States
    isLoading,
    isSubmitting,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    saveError,
    saveAttempts,
    
    // Handlers
    handleInputChange,
    handleSubmit,
    handleSave,
    resetError,
    retrySave
  } = useProxyDataEntry({
    schoolId,
    categoryId,
    columnId,
    onComplete
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Məlumatlar yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProxyDataEntryHeader
        schoolName={schoolData?.name}
        categoryName={categoryData?.name}
        onClose={onClose}
      />

      {/* Status Notifications */}
      <ProxyNotificationStatus
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
      />

      {/* Auto Save Indicator */}
      <AutoSaveIndicator
        isSaving={isSaving}
        autoSaveEnabled={true}
        lastSaveTime={lastSaved}
        saveError={saveError}
        saveAttempts={saveAttempts}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={handleSave}
        onRetry={retrySave}
        onResetError={resetError}
      />

      {/* Main Form Card */}
      <Card>
        <CardContent className="p-6">
          {/* Form Fields */}
          <FormFields
            columns={columns || []}
            formData={formData}
            onChange={handleInputChange}
            readOnly={false}
          />

          {/* Form Actions */}
          <ProxyFormActions
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Make sure the component is exported as default
export default SectorAdminProxyDataEntry;
