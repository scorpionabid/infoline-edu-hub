
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolColumnReport } from '@/hooks/useSchoolColumnReport';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CategoryWithColumns } from '@/types/column';
import { Check, X, Loader2, FileDown } from 'lucide-react';
import { exportTableToExcel } from '@/utils/excelExport';
import { toast } from '@/components/ui/use-toast';

const SchoolColumnTable: React.FC = () => {
  const { t } = useLanguage();
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    isCategoriesLoading,
    isCategoriesError,
    isDataLoading
  } = useSchoolColumnReport();

  // Seçilən kateqoriyanı tapaq
  const selectedCategory = React.useMemo(() => {
    return categories.find(cat => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  // Kateqoriya seçimi dəyişdikdə
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
  };

  // Excel-ə ixrac etmək üçün handler
  const handleExportToExcel = () => {
    if (isDataLoading || !selectedCategory || schoolColumnData.length === 0) {
      toast({
        title: t("errorExporting"),
        description: t("noDataToExport"),
        variant: "destructive",
      });
      return;
    }

    const fileName = `məktəb-məlumatları-${selectedCategory.name.toLowerCase().replace(/\s+/g, '-')}`;
    const success = exportTableToExcel(schoolColumnData, selectedCategory, fileName);
    
    if (success) {
      toast({
        title: t("exportSuccess"),
        description: t("fileDownloaded"),
        variant: "default",
      });
    } else {
      toast({
        title: t("exportError"),
        description: t("tryAgainLater"),
        variant: "destructive",
      });
    }
  };

  // Dəyər tipinə görə göstərilməsi
  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === 'boolean') {
      return value ? 
        <Check className="h-5 w-5 text-green-500" /> : 
        <X className="h-5 w-5 text-red-500" />;
    }

    return value;
  };

  // Yüklənmə vəziyyəti
  if (isCategoriesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Xəta vəziyyəti
  if (isCategoriesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="text-destructive text-4xl mb-4">!</div>
            <h3 className="text-lg font-medium">{t("errorLoading")}</h3>
            <p className="text-muted-foreground mt-2">{t("tryAgainLater")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{t("schoolColumnReportTitle")}</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("selectCategory")}:
            </span>
            <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: CategoryWithColumns) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportToExcel}
            disabled={isDataLoading || schoolColumnData.length === 0}
            className="ml-2"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {t("excelExport")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          {isDataLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium min-w-[250px]">{t("schoolName")}</TableHead>
                  {selectedCategory?.columns.map(column => (
                    <TableHead key={column.id} className="font-medium min-w-[150px]">
                      {column.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolColumnData.map(school => (
                  <TableRow key={school.schoolId}>
                    <TableCell className="font-medium">{school.schoolName}</TableCell>
                    {selectedCategory?.columns.map(column => {
                      const columnData = school.columnData.find(
                        cd => cd.columnId === column.id
                      );
                      return (
                        <TableCell key={`${school.schoolId}-${column.id}`}>
                          {renderCellValue(columnData?.value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolColumnTable;
