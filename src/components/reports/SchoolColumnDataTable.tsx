import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ExportButtons } from "@/components/ui/export-buttons";
import {
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  Building,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Refactored components
import SchoolColumnFilters from "./SchoolColumnFilters";
import SchoolSelectionPanel from "./SchoolSelectionPanel";
import ColumnSelectionPanel from "./ColumnSelectionPanel";
import SchoolColumnDataGrid from "./SchoolColumnDataGrid";
import SchoolColumnPagination from "./SchoolColumnPagination";

// Custom hooks
import { useSchoolColumnFilters } from "@/hooks/reports/useSchoolColumnFilters";
import { useSchoolColumnData } from "@/hooks/reports/useSchoolColumnData";
import { useSchoolColumnExport } from "@/hooks/reports/useSchoolColumnExport";
import { usePagination } from "@/hooks/common/usePagination";

// Utils
import { getSelectionStats } from "@/utils/reports/schoolColumnDataUtils";

const SchoolColumnDataTable: React.FC = () => {
  const { t } = useTranslation();

  // UI states
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Custom hooks
  const { filters, debouncedSearchQuery, updateFilter, resetFilters } =
    useSchoolColumnFilters();

  const {
    schools,
    columns,
    schoolColumnData,
    regions,
    sectors,
    categories,
    selectedColumnIds,
    setSelectedColumnIds,
    selectedSchoolIds,
    setSelectedSchoolIds,
    columnSort,
    setColumnSort,
    loading,
    dataLoading,
    error,
    permissions,
  } = useSchoolColumnData(filters, debouncedSearchQuery);

  const { handleExport } = useSchoolColumnExport();

  const { currentPage, pageSize, setCurrentPage, setPageSize, totalPages } =
    usePagination({
      totalItems: schoolColumnData.length,
      initialPageSize: 10,
    });

  // Event handlers
  const handleColumnSelect = (columnId: string, checked: boolean) => {
    if (checked) {
      setSelectedColumnIds((prev) => [...prev, columnId]);
    } else {
      setSelectedColumnIds((prev) => prev.filter((id) => id !== columnId));
    }
  };

  const handleSchoolSelect = (schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchoolIds((prev) => [...prev, schoolId]);
    } else {
      setSelectedSchoolIds((prev) => prev.filter((id) => id !== schoolId));
    }
  };

  const handleSelectAllSchools = (checked: boolean) => {
    if (checked) {
      setSelectedSchoolIds(schools.map((school) => school.id));
    } else {
      setSelectedSchoolIds([]);
    }
  };

  const handleSelectAllColumns = (checked: boolean) => {
    if (checked) {
      setSelectedColumnIds(columns.map((col) => col.id));
    } else {
      setSelectedColumnIds([]);
    }
  };

  const handleColumnSort = (columnId: string) => {
    setColumnSort((prev) => {
      if (prev.columnId === columnId) {
        // Cycle through: asc -> desc -> null
        if (prev.order === "asc") {
          return { columnId, order: "desc" };
        } else if (prev.order === "desc") {
          return { columnId: "", order: null };
        }
      }
      return { columnId, order: "asc" };
    });
  };

  const handleResetFilters = () => {
    resetFilters();
    setSelectedColumnIds([]);
    setSelectedSchoolIds([]);
    setCurrentPage(1);
    setColumnSort({ columnId: "", order: null });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Məlumatlar yüklənir...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const selectedColumns = columns.filter((col) =>
    selectedColumnIds.includes(col.id),
  );
  const selectionStats = getSelectionStats(
    schools.length,
    selectedSchoolIds.length,
    columns.length,
    selectedColumns.length,
    schoolColumnData.length,
    currentPage,
    pageSize,
  );

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtrlər və Sütun Seçimi
                </div>
                {filtersOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <SchoolColumnFilters
                filters={filters}
                onFilterChange={updateFilter}
                onResetFilters={handleResetFilters}
                regions={regions}
                sectors={sectors}
                categories={categories}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                permissions={permissions}
              />

              <SchoolSelectionPanel
                schools={schools}
                selectedSchoolIds={selectedSchoolIds}
                onSchoolSelect={handleSchoolSelect}
                onSelectAll={handleSelectAllSchools}
              />

              <ColumnSelectionPanel
                columns={columns}
                selectedColumnIds={selectedColumnIds}
                selectedCategory={filters.selectedCategory}
                onColumnSelect={handleColumnSelect}
                onSelectAll={handleSelectAllColumns}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Export Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{selectionStats}</div>
        <ExportButtons
          onExportExcel={() =>
            handleExport("excel", schoolColumnData, selectedColumns)
          }
          onExportPDF={() =>
            handleExport("pdf", schoolColumnData, selectedColumns)
          }
          onExportCSV={() =>
            handleExport("csv", schoolColumnData, selectedColumns)
          }
          isLoading={dataLoading}
          disabled={
            selectedColumnIds.length === 0 || schoolColumnData.length === 0
          }
        />
      </div>

      {/* Data Table */}
      {selectedColumnIds.length > 0 &&
      (selectedSchoolIds.length > 0 || selectedSchoolIds.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Məktəb-Sütun Məlumatları Cədvəli
              {columnSort.order && (
                <Badge variant="outline" className="ml-2">
                  Sıralanıb:{" "}
                  {columns.find((c) => c.id === columnSort.columnId)?.name}(
                  {columnSort.order === "asc" ? "A-Z" : "Z-A"})
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolColumnDataGrid
              schoolColumnData={schoolColumnData}
              selectedColumns={selectedColumns}
              columnSort={columnSort}
              onColumnSort={handleColumnSort}
              isLoading={dataLoading}
              currentPage={currentPage}
              pageSize={pageSize}
            />

            <SchoolColumnPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={schoolColumnData.length}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {selectedColumnIds.length === 0
                ? "Kateqoriya və Sütun Seçin"
                : "Məktəb Seçin"}
            </h3>
            <p className="text-muted-foreground">
              {selectedColumnIds.length === 0
                ? "Məktəb məlumatlarını görmək üçün əvvəlcə kateqoriya seçin və sütunlar avtomatik seçiləcək."
                : "Məlumatları görmək üçün ən azı bir məktəb seçin və ya axtarış/filtrlərə uyğun məktəblər olduğundan əmin olun."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolColumnDataTable;
