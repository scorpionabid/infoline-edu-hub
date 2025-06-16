import React from "react";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useDataEntryManager } from "@/hooks/dataEntry/useDataEntryManager";
import { DataEntryForm } from "@/components/dataEntry/DataEntryForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

/**
 * Məktəb Admin Məlumat Daxil Etmə Komponenti
 *
 * Bu komponent məktəb adminləri üçün məxsus məlumat daxil etmə interfeysidir.
 * Yalnız assignment="all" olan kateqoriyaları göstərir.
 * Real-time auto-save və form state management dəstəkləyir.
 */
const SchoolAdminDataEntry: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  // Get school ID from user data
  const schoolId = user?.school_id || user?.schoolId;

  // Enhanced data entry manager with form state
  const {
    categories,
    loading,
    error,
    refetch,
    // Enhanced form management
    formData,
    isLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    lastSaved,
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData,
  } = useDataEntryManager({
    // Obyekt şəklində parametrləri ötürürük
    schoolId: schoolId as string, // Məktəb ID-sini ötürürük
    userId: user?.id, // İstifadəçi ID-sini ötürürük
    autoSave: true, // Avtomatik yadda saxlama aktivləşdiririk
    enableRealTime: true, // Real-time yeniləməni aktivləşdiririk
  });

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p>{t("loadingData") || "Məlumatlar yüklənir..."}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenidən cəhd et
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No school assigned
  if (!schoolId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sizə hələ məktəb təyin edilməyib. Zəhmət olmasa, sistem administratoru
          ilə əlaqə saxlayın.
        </AlertDescription>
      </Alert>
    );
  }

  // No categories available
  if (categories.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Hal-hazırda məlumat daxil etmək üçün aktiv kateqoriya yoxdur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Məlumat Daxil Etmə</h1>
          <p className="text-muted-foreground">
            Məktəbiniz üçün lazımi məlumatları daxil edin
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status badge */}
          <Badge
            variant={
              entryStatus === "approved"
                ? "default"
                : entryStatus === "pending"
                  ? "secondary"
                  : entryStatus === "rejected"
                    ? "destructive"
                    : "outline"
            }
          >
            {entryStatus === "approved"
              ? "Təsdiqləndi"
              : entryStatus === "pending"
                ? "Gözləyir"
                : entryStatus === "rejected"
                  ? "Rədd edildi"
                  : "Qaralama"}
          </Badge>

          {/* Last saved indicator */}
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Son yenilənmə: {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {/* Modified indicator */}
          {isDataModified && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-600"
            >
              Dəyişikliklər var
            </Badge>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleSave("draft")}
            disabled={isSaving || !isDataModified}
            variant="outline"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Yadda saxla
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !Object.keys(formData).length}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Təsdiq üçün göndər
          </Button>
        </div>

        <Button onClick={resetForm} variant="ghost" disabled={!isDataModified}>
          Sıfırla
        </Button>
      </div>

      {/* Categories */}
      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
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
                onFormDataChange={handleFormDataChange}
                onFieldChange={handleFieldChange}
                readOnly={entryStatus === "approved"}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolAdminDataEntry;
