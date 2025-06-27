import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataEntryModeProps } from "../types";
import { DataEntryForm } from "@/components/dataEntry/DataEntryForm";
import ProgressTracker from "@/components/dataEntry/core/ProgressTracker";
import AutoSaveIndicator from "@/components/dataEntry/core/AutoSaveIndicator";

export const DataEntryMode: React.FC<DataEntryModeProps> = React.memo(({
  category,
  schoolId,
  formData,
  onFormDataChange,
  onFieldChange,
  entryStatus,
  isLoading,
  isSaving,
  isDataModified,
  lastSaved,
  autoSaveError,
  saveAttempts,
  onManualSave,
  onRetryAutoSave,
  onResetAutoSaveError,
  onBack,
  onNext,
  completionStats,
  focusColumnId,
  returnUrl
}) => {
  const categoryStats = completionStats.categories.find(
    (stat: any) => stat.categoryId === category.id
  );

  // Determine back button text based on return URL
  const backButtonText = returnUrl === '/dashboard' ? 'Dashboard-a qayıt' : 'Kateqoriyalara qayıt';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {backButtonText}
        </Button>
        <Button onClick={onNext}>
          Yekun baxış
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Auto Save Indicator */}
      <AutoSaveIndicator
        isSaving={isSaving}
        autoSaveEnabled={true}
        lastSaveTime={lastSaved}
        saveError={autoSaveError}
        saveAttempts={saveAttempts}
        hasUnsavedChanges={isDataModified}
        onManualSave={onManualSave}
        onRetry={onRetryAutoSave}
        onResetError={onResetAutoSaveError}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category.name}
                <Badge variant="outline">{category.columns.length} sahə</Badge>
              </CardTitle>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <DataEntryForm
                category={category}
                schoolId={schoolId}
                formData={formData}
                onFormDataChange={onFormDataChange}
                onFieldChange={onFieldChange}
                readOnly={entryStatus === "approved"}
                isLoading={isLoading}
                focusColumnId={focusColumnId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <ProgressTracker
            columns={category.columns}
            formData={formData}
            completionPercentage={categoryStats?.completionPercentage || 0}
            hasAllRequiredFields={categoryStats?.completionPercentage === 100}
            isValid={true}
          />
        </div>
      </div>
    </div>
  );
});

DataEntryMode.displayName = 'DataEntryMode';
