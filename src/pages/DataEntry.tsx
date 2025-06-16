import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useDataEntryManager } from "@/hooks/dataEntry/useDataEntryManager";
import type { EntryStatus } from "@/hooks/dataEntry/useDataEntryManager";
import { useSchoolCategories } from "@/hooks/categories/useCategoriesWithAssignment";
import { useColumns } from "@/hooks/columns/useColumns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DataEntryForm from "@/components/data-entry/DataEntryForm";

const DataEntry: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categoryId, schoolId } = useParams<{
    categoryId: string;
    schoolId: string;
  }>();
  const user = useAuthStore(selectUser);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Fetch categories with assignment 'all' in strict mode
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSchoolCategories({
    assignment: "all",
    strictMode: true,
    enabled: !!categoryId,
  });

  // Fetch columns for the selected category
  const {
    data: columns = [],
    isLoading: columnsLoading,
    error: columnsError,
  } = useColumns({
    categoryId: categoryId || "",
  });

  // Log errors if any
  useEffect(() => {
    if (categoriesError) {
      console.error("Error loading categories:", categoriesError);
      toast.error(
        t("errorLoadingCategories") ||
          "Kateqoriyalar yüklənərkən xəta baş verdi",
      );
    }

    if (columnsError) {
      console.error("Error loading columns:", columnsError);
      toast.error(
        t("errorLoadingColumns") || "Sütunlar yüklənərkən xəta baş verdi",
      );
    }
  }, [categoriesError, columnsError, t]);

  const {
    handleSave,
    handleSubmit,
    isSaving,
    isLoading: isDataLoading,
    formData: managerFormData,
    handleFieldChange: managerHandleFieldChange,
  } = useDataEntryManager({
    categoryId,
    schoolId,
    userId: user?.id,
  });

  // Sync local form data with manager's form data
  useEffect(() => {
    if (managerFormData && Object.keys(managerFormData).length > 0) {
      setFormData(managerFormData);
      setHasInitialData(true);
    }
  }, [managerFormData]);

  // Auto-navigate back if essential data is missing
  useEffect(() => {
    if (!categoryId || !schoolId) {
      console.warn(
        "Missing required parameters - navigating back to data entry",
      );
      navigate("/data-entry", { replace: true });
    }
  }, [categoryId, schoolId, navigate]);

  useEffect(() => {
    if (!categoryId || !schoolId) {
      console.warn("Category ID or School ID is missing.");
      return;
    }
  }, [categoryId, schoolId]);

  const handleInputChange = (columnId: string, value: any) => {
    // Update both local state and manager's state
    setFormData((prev) => ({ ...prev, [columnId]: value }));
    managerHandleFieldChange(columnId, value);
  };

  const validateForm = () => {
    if (!categoryId || !schoolId) {
      toast.error(
        t("missingCategoryOrSchool") || "Kateqoriya və ya məktəb seçilməyib",
      );
      return false;
    }

    const requiredColumns = columns.filter((col) => col.is_required);
    for (const column of requiredColumns) {
      if (!formData[column.id]) {
        toast.error(
          `${column.name} ${t("isRequired") || "sahəsi tələb olunur"}`,
        );
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = async (status: EntryStatus) => {
    if (!categoryId || !schoolId || !user) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // For draft, use handleSave
      if (status === "draft") {
        const success = await handleSave("draft");
        if (success) {
          toast.success(
            t("dataSavedAsDraft") || "Məlumatlar layihə kimi saxlanıldı",
          );
          navigate("/data-entry");
        }
      }
      // For pending submission, use handleSubmit
      else if (status === "pending") {
        const success = await handleSubmit();
        if (success) {
          toast.success(
            t("dataSubmittedForReview") ||
              "Məlumatlar yoxlanılmaq üçün göndərildi",
          );
          navigate("/data-entry");
        }
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(
        t("dataSubmissionFailed") || "Məlumat göndərilməsində xəta baş verdi",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if any data is still loading
  if (categoriesLoading || columnsLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading") || "Yüklənir..."}</span>
      </div>
    );
  }

  // Check if we have a valid category ID
  if (!categoryId) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">
          {t("categoryNotSelected") || "Kateqoriya seçilməyib"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("pleaseSelectCategoryFirst") ||
            "Zəhmət olmasa əvvəlcə məlumat daxil etmək istədiyiniz kateqoriyanı seçin"}
        </p>
        <Button onClick={() => navigate("/data-entry")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDataEntry") || "Məlumat Giriş Səhifəsinə Qayıt"}
        </Button>
      </div>
    );
  }

  // Check if we have a valid school ID
  if (!schoolId) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">
          {t("schoolNotSelected") || "Məktəb seçilməyib"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("pleaseSelectSchoolFirst") ||
            "Zəhmət olmasa əvvəlcə məktəbi seçin"}
        </p>
        <Button onClick={() => navigate("/data-entry")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDataEntry") || "Məlumat Giriş Səhifəsinə Qayıt"}
        </Button>
      </div>
    );
  }

  // Find the selected category and its columns
  const category = categories.find((cat) => cat.id === categoryId);
  const categoryColumns = columns.filter(
    (col) => col.category_id === categoryId,
  );

  // Show category not found if no matching category is found
  if (!category) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">
          {t("categoryNotFound") ||
            `"${categoryId}" ID-li kateqoriya tapılmadı`}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("categoryMayBeDeleted") ||
            "Bu kateqoriya silinmiş və ya dəyişdirilmiş ola bilər"}
        </p>
        <Button onClick={() => navigate("/data-entry")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDataEntry") || "Məlumat Giriş Səhifəsinə Qayıt"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/data-entry")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back") || "Geri"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dataEntry") || "Məlumat Girişi"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataEntryForm
            columns={categoryColumns}
            formData={formData}
            onChange={setFormData}
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => handleFormSubmit("draft")}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {t("saveAsDraft") || "Layihə kimi saxla"}
            </Button>
            <Button
              onClick={() => handleFormSubmit("pending")}
              disabled={isSubmitting}
            >
              {isSubmitting || isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t("submitForReview") || "Yoxlanılmaq üçün göndər"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntry;
