
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Column, CategoryWithColumns } from "@/types/column";
import { Category } from "@/types/category";
import ColumnList from "@/components/columns/ColumnList";
import ColumnHeader from "@/components/columns/ColumnHeader";
import AddColumnDialog from "@/components/columns/AddColumnDialog";
import ImportColumnsDialog from "@/components/columns/ImportColumnsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileSpreadsheet, InfoIcon, LayoutGrid } from "lucide-react";

// Kategoriziyaları əldə etmək üçün API 
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return mock data
  return [
    {
      id: "1",
      name: "Təcili məlumatlar",
      assignment: "all",
      createdAt: new Date("2023-01-15").toISOString(),
      updatedAt: new Date("2023-02-10").toISOString(),
      status: "active",
      priority: 1,
      description: "Məktəbin ümumi təsviri və əsas məlumatları",
      columnCount: 3,
    },
    {
      id: "2",
      name: "Tədris",
      assignment: "sectors",
      createdAt: new Date("2023-01-20").toISOString(),
      updatedAt: new Date("2023-03-05").toISOString(),
      status: "active",
      priority: 2,
      description: "Tədris planı və proqram məlumatları",
      columnCount: 2,
    },
    {
      id: "3",
      name: "İnfrastruktur",
      assignment: "all",
      createdAt: new Date("2023-02-01").toISOString(), 
      updatedAt: new Date("2023-02-20").toISOString(),
      status: "active",
      priority: 3,
      description: "Məktəbin infrastruktur və texniki məlumatları",
      columnCount: 3,
    },
    {
      id: "4",
      name: "Davamiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-02-15").toISOString(),
      updatedAt: new Date("2023-04-10").toISOString(),
      status: "active",
      priority: 4,
      description: "Davamiyyət haqqında məlumatlar",
      columnCount: 3,
    },
    {
      id: "5",
      name: "Nailiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-03-01").toISOString(),
      updatedAt: new Date("2023-03-25").toISOString(),
      status: "active",
      priority: 5,
      description: "Şagirdlərin akademik nailiyyətləri və statistikaları",
      columnCount: 2,
    }
  ];
};

// Sütun statistikası üçün API
const fetchColumnStats = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    totalColumns: 8,
    requiredColumns: 6,
    columnsPerType: {
      text: 2,
      number: 2,
      date: 1,
      select: 1,
      checkbox: 1,
      radio: 1,
      file: 0,
      image: 0,
    },
    completionRate: 75,
  };
};

// Sütunları əldə etmək üçün API
const fetchColumns = async (): Promise<Column[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // Return mock data
  return [
    {
      id: "1",
      categoryId: "1",
      name: "Məktəbin adı",
      type: "text",
      isRequired: true,
      placeholder: "Məktəbin tam adını daxil edin",
      helpText: "Məktəbin rəsmi adını daxil edin",
      order: 1,
      status: "active",
    },
    {
      id: "2",
      categoryId: "1",
      name: "Şagird sayı",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 0,
        maxValue: 10000,
      },
      placeholder: "Ümumi şagird sayını daxil edin",
      order: 2,
      status: "active",
    },
    {
      id: "3",
      categoryId: "1",
      name: "Təhsil növü",
      type: "select",
      isRequired: true,
      options: ["Ümumi", "Texniki", "Humanitar", "Digər"],
      order: 3,
      status: "active",
    },
    {
      id: "4",
      categoryId: "2",
      name: "Tədris dili",
      type: "radio",
      isRequired: true,
      options: ["Azərbaycan", "Rus", "İngilis", "Türk"],
      order: 1,
      status: "active",
    },
    {
      id: "5",
      categoryId: "2",
      name: "Həftəlik saat",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 1,
        maxValue: 50,
      },
      order: 2,
      status: "active",
    },
    {
      id: "6",
      categoryId: "3",
      name: "Laboratoriya mövcudluğu",
      type: "checkbox",
      isRequired: false,
      options: ["Fizika", "Kimya", "Biologiya", "İnformatika"],
      order: 1,
      status: "active",
    },
    {
      id: "7",
      categoryId: "3",
      name: "Binanın tikildiyi il",
      type: "date",
      isRequired: true,
      order: 2,
      status: "inactive",
    },
    {
      id: "8",
      categoryId: "3",
      name: "Binanın fotosu",
      type: "image",
      isRequired: false,
      order: 3,
      status: "active",
    },
    {
      id: "9",
      categoryId: "4",
      name: "Davamiyyət faizi",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 0,
        maxValue: 100,
      },
      order: 1,
      status: "active",
    },
    {
      id: "10",
      categoryId: "4",
      name: "Qeydiyyat tarixi",
      type: "date",
      isRequired: true,
      order: 2,
      status: "active",
    },
    {
      id: "11",
      categoryId: "5",
      name: "Orta qiymət",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 1,
        maxValue: 5,
      },
      order: 1,
      status: "active",
    },
    {
      id: "12",
      categoryId: "5",
      name: "Olimpiada iştirakçıları",
      type: "number",
      isRequired: false,
      order: 2,
      status: "active",
    }
  ];
};

const Columns = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [columnToEdit, setColumnToEdit] = useState<Column | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("list");

  // Kateqoriyaları əldə etmək
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Sütunları əldə etmək
  const {
    data: columns = [],
    isLoading: isColumnsLoading,
    isError: isColumnsError,
    refetch: refetchColumns,
  } = useQuery({
    queryKey: ["columns"],
    queryFn: fetchColumns,
  });

  // Sütun statistikasını əldə etmək
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["columnStats"],
    queryFn: fetchColumnStats,
  });

  // Axtarış və filtrləmə
  const filteredColumns = columns.filter((column) => {
    const matchesSearch = column.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || column.categoryId === categoryFilter;
    const matchesType =
      typeFilter === "all" || column.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || column.status === statusFilter;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Kateqoriyaya görə qruplaşdırma
  const columnsByCategory = categories.map(category => {
    const categoryColumns = columns.filter(column => 
      column.categoryId === category.id && 
      (statusFilter === "all" || column.status === statusFilter) &&
      (typeFilter === "all" || column.type === typeFilter) &&
      column.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      ...category,
      columns: categoryColumns,
    };
  }).filter(category => category.columns.length > 0);

  // Sütunları əlavə etmə/redaktə etmə
  const handleAddOrEditColumn = async (columnData: Omit<Column, "id">) => {
    try {
      // Real tətbiqdə API çağırışı olacaq
      console.log("Sütun əlavə edilir/redaktə edilir:", columnData);
      
      // Uğurlu API çağırışı simulyasiyası
      const actionType = columnToEdit ? "updated" : "added";
      
      toast.success(t(columnToEdit ? "columnUpdated" : "columnAdded"), {
        description: t(columnToEdit ? "columnUpdatedSuccess" : "columnAddedSuccess"),
      });
      
      // Redaktə halını sıfırla
      setColumnToEdit(undefined);
      
      // Sütunları yenidən əldə et
      await refetchColumns();
      
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
      // Real tətbiqdə API çağırışı olacaq
      console.log("Silinən sütun ID:", id);
      
      // Uğurlu API çağırışı simulyasiyası
      toast.success(t("columnDeleted"), {
        description: t("columnDeletedSuccess"),
      });
      
      // Sütunları yenidən əldə et
      await refetchColumns();
      
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
      // Real tətbiqdə API çağırışı olacaq
      console.log("Sütun statusu yenilənir:", id, status);
      
      // Uğurlu API çağırışı simulyasiyası
      toast.success(t("columnUpdated"), {
        description: t("columnStatusUpdatedSuccess"),
      });
      
      // Sütunları yenidən əldə et
      await refetchColumns();
      
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
  const handleEditColumn = (column: Column) => {
    setColumnToEdit(column);
    setIsAddDialogOpen(true);
  };

  // Şablon ixracı
  const handleExportTemplate = () => {
    // Real tətbiqdə Excel şablonu yaradıb yükləyəcək
    console.log("Excel şablonu ixrac edilir");
    
    toast.success(t("templateExported"), {
      description: t("templateExportedSuccess"),
    });
  };

  // Sütunların idxalı
  const handleImportColumns = async (file: File) => {
    try {
      // Real tətbiqdə Excel faylını emal edib sütunları idxal edəcək
      console.log("Fayldan sütunlar idxal edilir:", file.name);
      
      // Emal simulyasiyası
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Uğurlu idxal simulyasiyası
      toast.success(t("columnsImported"), {
        description: t("columnsImportedSuccess"),
      });
      
      // Sütunları yenidən əldə et
      await refetchColumns();
      
      return true;
    } catch (error) {
      console.error("Sütunların idxalı zamanı xəta:", error);
      toast.error(t("importFailed"), {
        description: t("importFailedDesc"),
      });
      return false;
    }
  };

  // Minimallaşdırılmış statistika kartları
  const MinimalisticStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{isStatsLoading ? "..." : stats?.totalColumns}</div>
          <p className="text-gray-400">Ümumi sütunlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{isStatsLoading ? "..." : stats?.requiredColumns}</div>
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
          <div className="text-4xl font-bold mb-2">{isStatsLoading ? "..." : `${stats?.completionRate}%`}</div>
          <Progress value={isStatsLoading ? 0 : stats?.completionRate} className="w-4/5 mt-2" />
          <p className="text-gray-400 mt-2">Tamamlanma</p>
        </CardContent>
      </Card>
    </div>
  );

  // Grid görünüşü komponenti
  const GridView = () => (
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
                    <div className={`w-2 h-2 rounded-full mr-2 ${column.isRequired ? 'bg-destructive' : 'bg-muted-foreground'}`} />
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
      
      {columnsByCategory.length === 0 && (
        <div className="col-span-full text-center py-12">
          <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{t("noColumnsFound")}</h3>
          <p className="text-muted-foreground">{t("adjustFiltersOrAddNew")}</p>
        </div>
      )}
    </div>
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
          onExportTemplate={handleExportTemplate}
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
              isLoading={isColumnsLoading || isCategoriesLoading}
              isError={isColumnsError}
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
          categories={categories}
          editColumn={columnToEdit}
          columns={columns}
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
