import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useColumns } from "@/hooks/useColumns";
import ColumnList from "@/components/columns/ColumnList";
import ColumnHeader from "@/components/columns/ColumnHeader";
import AddColumnDialog from "@/components/columns/AddColumnDialog";
import ImportColumnsDialog from "@/components/columns/ImportColumnsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileSpreadsheet, InfoIcon, LayoutGrid, Loader2 } from "lucide-react";
import { exportColumnsToExcel } from "@/utils/excelExport";
import { adaptSupabaseColumn } from "@/types/column";

const Columns = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [columnToEdit, setColumnToEdit] = useState<any | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("list");

  // Supabase-dən kateqoriyaları əldə edirik
  const {
    categories,
    loading: isCategoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategories();

  // Kateqoriyaların yüklənmə vəziyyətini və xətalarını izləyirik
  useEffect(() => {
    if (categoriesError) {
      console.error('Kateqoriyaları əldə edərkən xəta baş verdi:', categoriesError);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadCategories')
      });
    }
  }, [categoriesError, t]);

  // Kateqoriyaların formatını yoxlayırıq
  useEffect(() => {
    console.log('Columns səhifəsində kateqoriyalar:', categories);
  }, [categories]);

  // URL parametrlərinə əsasən kateqoriya filtrini yeniləyirik
  useEffect(() => {
    const categoryId = searchParams.get("category");
    if (categoryId) {
      setCategoryFilter(categoryId);
    }
  }, [searchParams]);

  // Supabase-dən sütunları əldə edirik
  const {
    columns,
    loading: isColumnsLoading,
    error: columnsError,
    addColumn,
    updateColumn,
    deleteColumn
  } = useColumns(categoryFilter !== "all" ? categoryFilter : undefined);

  // Axtarış və filtrləmə
  const filteredColumns = columns.filter((column) => {
    const matchesSearch = column.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || column.category_id === categoryFilter;
    const matchesType = typeFilter === "all" || column.type === typeFilter;
    const matchesStatus = statusFilter === "all" || column.status === statusFilter;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Kateqoriyaya görə qruplaşdırma
  const columnsByCategory = categories
    .filter(category => 
      categoryFilter === "all" || category.id === categoryFilter
    )
    .map(category => {
      const categoryColumns = columns.filter(column => 
        column.category_id === category.id && 
        (statusFilter === "all" || column.status === statusFilter) &&
        (typeFilter === "all" || column.type === typeFilter) &&
        column.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return {
        ...category,
        columns: categoryColumns,
      };
    })
    .filter(category => category.columns.length > 0);

  // Sütun statistikası
  const stats = React.useMemo(() => {
    return {
      totalColumns: columns.length,
      requiredColumns: columns.filter(col => col.is_required).length,
      columnsPerType: columns.reduce((acc, col) => {
        acc[col.type] = (acc[col.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      completionRate: categories.length > 0 ? Math.round((columns.length / categories.length) * 25) : 0
    };
  }, [columns, categories]);
  
  // Sütunları əlavə etmə/redaktə etmə
  const handleAddOrEditColumn = async (columnData: any) => {
    try {
      if (columnToEdit) {
        // Sütunu yeniləyirik
        await updateColumn(columnToEdit.id, columnData);
        toast.success(t("columnUpdated"), {
          description: t("columnUpdatedSuccess"),
        });
      } else {
        // Yeni sütun əlavə edirik
        await addColumn(columnData);
        toast.success(t("columnAdded"), {
          description: t("columnAddedSuccess"),
        });
      }
      
      // Redaktə halını sıfırla
      setColumnToEdit(undefined);
      setIsAddDialogOpen(false);
      
      return true;
    } catch (error) {
      console.error("Sütunu əlavə etmə/redaktə etmə zamanı xəta:", error);
      toast.error(t(columnToEdit ? "columnUpdateFailed" : "columnAddFailed"), {
        description: t(columnToEdit ? "columnUpdateFailedDesc" : "columnAddFailedDesc"),
      });
      return false;
    }
  };

  // Sütun silmə
  const handleDeleteColumn = async (id: string) => {
    try {
      await deleteColumn(id);
      return true;
    } catch (error) {
      console.error("Sütunu silmə zamanı xəta:", error);
      toast.error(t("columnDeleteFailed"), {
        description: t("columnDeleteFailedDesc"),
      });
      return false;
    }
  };

  // Sütun statusunu yeniləmə
  const handleUpdateColumnStatus = async (id: string, status: "active" | "inactive") => {
    try {
      await updateColumn(id, { status });
      toast.success(t("columnUpdated"), {
        description: t("columnStatusUpdatedSuccess"),
      });
      return true;
    } catch (error) {
      console.error("Sütun statusunu yeniləmə zamanı xəta:", error);
      toast.error(t("columnUpdateFailed"), {
        description: t("columnUpdateFailedDesc"),
      });
      return false;
    }
  };

  // Sütun redaktə etmə
  const handleEditColumn = (column: any) => {
    // Supabase Column'ı Column tipinə çeviririk
    const adaptedColumn = adaptSupabaseColumn(column);
    setColumnToEdit(adaptedColumn);
    setIsAddDialogOpen(true);
  };

  // Excel ixracı
  const handleExportColumns = () => {
    exportColumnsToExcel(filteredColumns, categories);
  };

  // Sütunların idxalı
  const handleImportColumns = async (file: File) => {
    try {
      // Bu hissə Excel idxalını implementasiya edəcək
      toast.success(t("columnsImported"), {
        description: t("columnsImportedSuccess"),
      });
      setIsImportDialogOpen(false);
      return true;
    } catch (error) {
      console.error("Sütunların idxalı zamanı xəta:", error);
      toast.error(t("importFailed"), {
        description: t("importFailedDesc"),
      });
      return false;
    }
  };

  // Yüklənir/xəta durumları
  const isLoading = isCategoriesLoading || isColumnsLoading;
  const hasError = !!categoriesError || !!columnsError;

  // Mini statistika kartları
  const MinimalisticStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{isLoading ? "..." : stats.totalColumns}</div>
          <p className="text-gray-400">Ümumi sütunlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{isLoading ? "..." : stats.requiredColumns}</div>
          <p className="text-gray-400">Məcburi sütunlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{categories.length}</div>
          <p className="text-gray-400">Kateqoriyalar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{isLoading ? "..." : `${stats.completionRate}%`}</div>
          <Progress value={isLoading ? 0 : stats.completionRate} className="w-4/5 mt-2" />
          <p className="text-gray-400 mt-2">Tamamlanma</p>
        </CardContent>
      </Card>
    </div>
  );

  // Grid görünüşü komponenti
  const GridView = () => (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : hasError ? (
        <div className="text-center py-12 text-destructive">
          <InfoIcon className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-medium">{t("errorLoadingData")}</h3>
          <p className="text-muted-foreground">{t("tryAgainLater")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columnsByCategory.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{category.name}</h3>
                <div className="space-y-3">
                  {category.columns.map((column) => (
                    <div 
                      key={column.id} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleEditColumn(column)}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${column.is_required ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                        <span>{column.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">{t(column.type)}</span>
                        {column.status === "inactive" && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">{t("inactive")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!isLoading && columnsByCategory.length === 0 && (
            <div className="col-span-full text-center py-12">
              <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">{t("noColumnsFound")}</h3>
              <p className="text-muted-foreground">{t("adjustFiltersOrAddNew")}</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <ColumnHeader
          onAddColumn={() => {
            setColumnToEdit(undefined);
            setIsAddDialogOpen(true);
          }}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categories={categories}
          onExportTemplate={handleExportColumns}
          onImportColumns={() => setIsImportDialogOpen(true)}
        />

        <MinimalisticStats />

        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list">
              <Database className="h-4 w-4 mr-2" />
              Cədvəl
            </TabsTrigger>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Şəbəkə
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ColumnList
              columns={filteredColumns}
              categories={categories}
              isLoading={isLoading}
              isError={hasError}
              onDeleteColumn={handleDeleteColumn}
              onUpdateStatus={handleUpdateColumnStatus}
              onEditColumn={handleEditColumn}
            />
          </TabsContent>
          <TabsContent value="grid">
            <GridView />
          </TabsContent>
        </Tabs>

        <AddColumnDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setColumnToEdit(undefined);
          }}
          onAddColumn={handleAddOrEditColumn}
          categories={categories.map(cat => ({
            id: cat.id,
            name: cat.name
          }))}
          editColumn={columnToEdit}
          columns={columns.map(adaptSupabaseColumn)}
        />

        <ImportColumnsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImportColumns={handleImportColumns}
        />
      </div>
    </SidebarLayout>
  );
};

export default Columns;
