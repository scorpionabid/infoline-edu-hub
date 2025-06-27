import React, { useState, useCallback, useEffect } from "react";
import { Column } from "@/types/column";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, CheckSquare, Square } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Input } from "@/components/ui/input";
import { usePermissions } from '@/hooks/auth/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ColumnTabs from "./ColumnTabs";
import EnhancedColumnList from "./EnhancedColumnList";
import BulkOperationsPanel from "./BulkOperationsPanel";
import ColumnDialog from "./unified/ColumnDialog";
import { useColumnMutations } from "@/hooks/columns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ColumnsContainerProps {
  columns?: Column[];
  categories?: Category[];
  selectedCategoryId?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreate?: () => void;
  onEdit?: (column: Column) => void;
  onDelete?: (id: string, name: string) => void;
  onRestore?: (id: string, name: string) => void;
  onPermanentDelete?: (id: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  onCreateColumn?: () => void;
  onEditColumn?: (column: Column) => void;
  onArchiveColumn?: (column: Column) => void;
  onRestoreColumn?: (column: Column) => void;
  onDeleteColumn?: (column: Column, permanent?: boolean) => void;
  isCreateDialogOpen?: boolean;
  isEditDialogOpen?: boolean;
  onCreateDialogClose?: () => void;
  onEditDialogClose?: () => void;
  createFormProps?: any;
  editFormProps?: any;
}

const ColumnsContainer: React.FC<ColumnsContainerProps> = ({
  columns = [],
  categories = [],
  selectedCategoryId = "",
  isLoading = false,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onCategoryChange = () => {},
  onCreateColumn = () => {},
  onArchiveColumn = () => {},
  onRestoreColumn = () => {},
  onDeleteColumn = () => {},
  isCreateDialogOpen = false,
  isEditDialogOpen = false,
  onCreateDialogClose = () => {},
  onEditDialogClose = () => {},
  createFormProps = {},
  editFormProps = {},
}) => {
  const { t } = useTranslation();
  const { canManageColumns } = usePermissions();

  // Loading state for dialog
  const [formLoading, setFormLoading] = useState(false);

  // Enhanced column mutations - with all required methods
  const {
    duplicateColumn,
    bulkToggleStatus,
    moveColumnsToCategory,
    bulkDelete,
    duplicateColumnAsync,
    bulkToggleStatusAsync,
    moveColumnsToCategoryAsync,
    bulkDeleteAsync,
  } = useColumnMutations();

  // Persistent tab state with localStorage
  const [activeTab, setActiveTab] = React.useState<"active" | "archived">(
    () => {
      try {
        return (
          (localStorage.getItem("columns-active-tab") as
            | "active"
            | "archived") || "active"
        );
      } catch {
        return "active";
      }
    },
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Persist tab state
  useEffect(() => {
    try {
      localStorage.setItem("columns-active-tab", activeTab);
    } catch {
      // Ignore localStorage errors
    }
  }, [activeTab]);

  // Selection management functions
  const toggleColumnSelection = useCallback((columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId],
    );
  }, []);

  const selectAllColumns = useCallback((columns: Column[]) => {
    setSelectedColumns(columns.map((col) => col.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  // Separate active and archived columns
  const activeColumns = React.useMemo(() => {
    return columns?.filter((column) => column.status === "active") || [];
  }, [columns]);

  const archivedColumns = React.useMemo(() => {
    // Include both 'deleted' and 'inactive' columns in archived
    return (
      columns?.filter(
        (column) => column.status === "deleted" || column.status === "inactive",
      ) || []
    );
  }, [columns]);

  // Calculate stats
  const stats = React.useMemo(
    () => ({
      total: columns.length,
      active: activeColumns.length,
      archived: archivedColumns.length,
      selected: selectedColumns.length,
    }),
    [
      columns.length,
      activeColumns.length,
      archivedColumns.length,
      selectedColumns.length,
    ],
  );

  // Get current columns based on active tab
  const currentColumns =
    activeTab === "active" ? activeColumns : archivedColumns;

  // Enhanced filtering
  const filteredColumns = React.useMemo(() => {
    if (!currentColumns || !Array.isArray(currentColumns)) return [];

    const filtered = currentColumns.filter((column) => {
      const matchesSearch =
        searchQuery === "" ||
        column.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        column.help_text?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || column.status === statusFilter;
      const matchesType = typeFilter === "all" || column.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || column.category_id === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });

    return filtered;
  }, [
    currentColumns,
    searchQuery,
    statusFilter,
    typeFilter,
    categoryFilter,
    activeTab,
  ]);

  // Get unique types for filter dropdown
  const uniqueTypes = React.useMemo(() => {
    const types = new Set(
      columns
        .map((col) => col.type)
        .filter((type) => type && type.trim() !== ""),
    );
    return Array.from(types);
  }, [columns]);

  const handleSelectAll = () => {
    const allFilteredIds = filteredColumns.map((col) => col.id);
    if (selectedColumns.length === allFilteredIds.length) {
      clearSelection();
    } else {
      selectAllColumns(filteredColumns);
    }
  };

  // FIXED: Handle toggle status with proper function signatures
  const handleToggleStatus = async (
    columnId: string,
    status: "active" | "inactive",
  ) => {
    try {
      console.log(`Toggling column ${columnId} to status: ${status}`);

      if (bulkToggleStatusAsync) {
        await bulkToggleStatusAsync({ columnIds: [columnId], status });
      } else {
        bulkToggleStatus({ columnIds: [columnId], status });
      }

      if (status === "inactive") {
        setActiveTab("archived");
      }

      onRefresh?.();
      console.log(`Successfully toggled column ${columnId} to ${status}`);
    } catch (error) {
      console.error("Toggle status error:", error);
    }
  };

  const handleDuplicate = async (column: Column) => {
    try {
      if (duplicateColumnAsync) {
        await duplicateColumnAsync(column.id);
      } else {
        duplicateColumn(column.id);
      }
      onRefresh?.();
    } catch (error) {
      console.error("Duplicate error:", error);
    }
  };

  // FIXED: Handle bulk operations with correct parameters
  const handleBulkDelete = async (columnIds: string[]) => {
    try {
      if (bulkDeleteAsync) {
        await bulkDeleteAsync(columnIds);
      } else {
        bulkDelete(columnIds);
      }
      onRefresh?.();
      return true;
    } catch (error) {
      console.error("Bulk delete error:", error);
      return false;
    }
  };

  const handleBulkToggle = async (
    columnIds: string[],
    status: "active" | "inactive",
  ) => {
    try {
      if (bulkToggleStatusAsync) {
        await bulkToggleStatusAsync({ columnIds, status });
      } else {
        bulkToggleStatus({ columnIds, status });
      }
      onRefresh?.();
      return true;
    } catch (error) {
      console.error("Bulk toggle error:", error);
      return false;
    }
  };

  const handleBulkMoveCategory = async (
    columnIds: string[],
    categoryId: string,
  ) => {
    try {
      if (moveColumnsToCategoryAsync) {
        await moveColumnsToCategoryAsync({ columnIds, categoryId });
      } else {
        moveColumnsToCategory({ columnIds, categoryId });
      }
      onRefresh?.();
      return true;
    } catch (error) {
      console.error("Bulk move error:", error);
      return false;
    }
  };

  const handleDragAndDropReorder = async (reorderedColumns: Column[]) => {
    console.log("Drag and drop reorder:", reorderedColumns);
    return true;
  };

  // Handle permanent delete
  const handlePermanentDelete = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;
      
      toast.success('Sütun təmamən silindi');
      onRefresh?.();
    } catch (error) {
      console.error("Permanent delete error:", error);
      toast.error('Sütun silinərkən xəta baş verdi');
    }
  };

  // Handle restore
  const handleRestore = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'active' })
        .eq('id', columnId);

      if (error) throw error;
      
      toast.success('Sütun bərpa edildi');
      setActiveTab('active'); // Switch to active tab
      onRefresh?.();
    } catch (error) {
      console.error("Restore error:", error);
      toast.error('Sütun bərpa edilərkən xəta baş verdi');
    }
  };

  // Dialog handlers
  const handleCreateSave = async (formData: any) => {
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Sütun uğurla yaradıldı');
      onRefresh?.();
      return true;
    } catch (error) {
      console.error("Create column error:", error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSave = async (formData: any) => {
    try {
      // Implementation needed
      console.log("Edit save:", formData);
      onRefresh?.();
      return true;
    } catch (error) {
      console.error("Edit column error:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("loadingColumns") || "Loading columns..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("navigation.columns")}</h1>
          <p className="text-muted-foreground">{t("general.manage_data_columns")}</p>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline">Ümumi: {stats.total}</Badge>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              Aktiv: {stats.active}
            </Badge>
            {stats.archived > 0 && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-600"
              >
                Arxiv: {stats.archived}
              </Badge>
            )}
            {stats.selected > 0 && (
              <Badge variant="default">Seçilmiş: {stats.selected}</Badge>
            )}
          </div>
        </div>

        {canManageColumns && (
          <Button onClick={onCreateColumn}>
            <Plus className="h-4 w-4 mr-2" />
            {t("columns.createColumn")}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchColumns") || "Search columns..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Kateqoriya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün kateqoriyalar</SelectItem>
              {categories
                .filter((category) => category.id && category.id.trim() !== "")
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name || "Adsız kateqoriya"}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün tiplər</SelectItem>
              {uniqueTypes
                .filter((type) => type && type.trim() !== "")
                .map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onRefresh}>
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {activeTab === "active" && filteredColumns.length > 0 && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-sm"
          >
            {selectedColumns.length === filteredColumns.length ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            {selectedColumns.length === filteredColumns.length
              ? "Seçimi ləğv et"
              : `Hamısını seç (${filteredColumns.length})`}
          </Button>
        </div>
      )}

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedColumns={selectedColumns}
        columns={columns}
        categories={categories}
        onBulkDelete={handleBulkDelete}
        onBulkToggleStatus={handleBulkToggle}
        onBulkMoveToCategory={handleBulkMoveCategory}
        onClearSelection={clearSelection}
      />

      {/* Tabs */}
      <ColumnTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeColumns.length}
        archivedCount={archivedColumns.length}
      />

      {/* Enhanced Column List */}
      <EnhancedColumnList
        columns={filteredColumns}
        categories={categories}
        selectedColumns={selectedColumns}
        onEditColumn={onEdit}
        onDeleteColumn={onDelete}
        onRestoreColumn={handleRestore}
        onPermanentDeleteColumn={handlePermanentDelete}
        onDuplicateColumn={handleDuplicate}
        onToggleColumnStatus={handleToggleStatus}
        onColumnSelection={toggleColumnSelection}
        onReorderColumns={handleDragAndDropReorder}
        canManageColumns={true}
        enableDragDrop={activeTab === "active"}
        showBulkActions={activeTab === "active"}
      />

      {/* Create Column Dialog */}
      <ColumnDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogClose}
        onSave={handleCreateSave}
        categories={categories}
        isLoading={formLoading}
      />

      {/* Edit Column Dialog */}
      {editFormProps && (
        <ColumnDialog
          mode="edit"
          open={isEditDialogOpen}
          onOpenChange={onEditDialogClose}
          onSave={handleEditSave}
          column={editFormProps.column}
          categories={categories}
          isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default ColumnsContainer;
