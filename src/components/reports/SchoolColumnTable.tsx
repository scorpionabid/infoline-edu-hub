import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolColumnReport } from '@/hooks/useSchoolColumnReport';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Check, 
  X, 
  Loader2, 
  FileDown, 
  Filter, 
  Search, 
  RotateCcw,
  CheckSquare,
  Eye,
  FileX,
  FileCheck,
  RefreshCcw
} from 'lucide-react';
import { ExportOptions } from '@/types/report';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const SchoolColumnTable: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      rejectionReason: '',
    },
  });
  
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    sectors,
    isCategoriesLoading,
    isCategoriesError,
    isDataLoading,
    exportData,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData
  } = useSchoolColumnReport("");

  const selectedCategory = React.useMemo(() => {
    return categories.find(cat => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const filteredData = React.useMemo(() => {
    if (!schoolColumnData) return [];

    return schoolColumnData.filter(school => {
      const matchesSearch = searchTerm === '' || 
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = selectedSectors.length === 0 || 
        selectedSectors.includes(school.sector || '');
      
      return matchesSearch && matchesSector;
    });
  }, [schoolColumnData, searchTerm, selectedSectors]);

  useEffect(() => {
    setIsSelectAll(selectedSchools.length === filteredData.length && filteredData.length > 0);
  }, [selectedSchools, filteredData]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSchools([]);
  };

  const handleExportToExcel = () => {
    if (isDataLoading || !selectedCategory || filteredData.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }

    const fileName = `məktəb-məlumatları-${selectedCategory.name.toLowerCase().replace(/\s+/g, '-')}`;
    const options: ExportOptions = { customFileName: fileName };
    
    try {
      const workbook = XLSX.utils.book_new();
      
      const headers = ['Məktəb adı', 'Region', 'Sektor', 'Status'];
      selectedCategory.columns.forEach(column => {
        headers.push(column.name);
      });
      
      const rows = filteredData.map(school => {
        const status = school.status || "Gözləmədə";
        
        const row: (string | number | boolean)[] = [school.schoolName, school.region || '', school.sector || '', status];
        selectedCategory.columns.forEach(column => {
          const columnData = school.columnData.find(cd => cd.columnId === column.id);
          const value = columnData?.value !== undefined ? String(columnData.value) : '';
          row.push(value);
        });
        return row;
      });
      
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Məktəb məlumatları');
      
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
      toast.success(t("fileDownloaded"));
    } catch (error) {
      console.error('Excel ixrac xətası:', error);
      toast.error(t("tryAgainLater"));
    }
  };

  const handleSectorToggle = (sectorName: string) => {
    setSelectedSectors(prev => {
      if (prev.includes(sectorName)) {
        return prev.filter(name => name !== sectorName);
      } else {
        return [...prev, sectorName];
      }
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSectors([]);
  };

  const handleSelectAllChange = () => {
    if (isSelectAll) {
      deselectAllSchools();
    } else {
      const allSchoolIds = filteredData.map(school => school.schoolId);
      setSelectedSchools(allSchoolIds);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSchoolSelection = (schoolId: string) => {
    toggleSchoolSelection(schoolId);
  };

  const handleApproveClick = (schoolId: string) => {
    setCurrentSchoolId(schoolId);
    setIsBulkAction(false);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (schoolId: string) => {
    setCurrentSchoolId(schoolId);
    setIsBulkAction(false);
    setShowRejectDialog(true);
  };

  const handleBulkApprove = () => {
    if (selectedSchools.length === 0) {
      toast.error(t("noSchoolsSelected"));
      return;
    }
    setIsBulkAction(true);
    setShowApproveDialog(true);
  };

  const handleBulkReject = () => {
    if (selectedSchools.length === 0) {
      toast.error(t("noSchoolsSelected"));
      return;
    }
    setIsBulkAction(true);
    setShowRejectDialog(true);
  };

  const confirmApprove = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isBulkAction) {
        toast.success(`${selectedSchools.length} məktəbin məlumatları təsdiqləndi`);
        selectedSchools.forEach(schoolId => {
          const schoolIndex = schoolColumnData.findIndex(s => s.schoolId === schoolId);
          if (schoolIndex !== -1) {
            schoolColumnData[schoolIndex].status = "Təsdiqləndi";
          }
        });
        deselectAllSchools();
      } else if (currentSchoolId) {
        toast.success("Məktəb məlumatları təsdiqləndi");
        const schoolIndex = schoolColumnData.findIndex(s => s.schoolId === currentSchoolId);
        if (schoolIndex !== -1) {
          schoolColumnData[schoolIndex].status = "Təsdiqləndi";
        }
      }
    } catch (error) {
      toast.error(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
      setShowApproveDialog(false);
      setCurrentSchoolId(null);
      setIsBulkAction(false);
    }
  };

  const confirmReject = async (formData: { rejectionReason: string }) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isBulkAction) {
        toast.success(`${selectedSchools.length} məktəbin məlumatları rədd edildi`);
        selectedSchools.forEach(schoolId => {
          const schoolIndex = schoolColumnData.findIndex(s => s.schoolId === schoolId);
          if (schoolIndex !== -1) {
            schoolColumnData[schoolIndex].status = "Rədd edildi";
            schoolColumnData[schoolIndex].rejectionReason = formData.rejectionReason;
          }
        });
        deselectAllSchools();
      } else if (currentSchoolId) {
        toast.success("Məktəb məlumatları rədd edildi");
        const schoolIndex = schoolColumnData.findIndex(s => s.schoolId === currentSchoolId);
        if (schoolIndex !== -1) {
          schoolColumnData[schoolIndex].status = "Rədd edildi";
          schoolColumnData[schoolIndex].rejectionReason = formData.rejectionReason;
        }
      }
    } catch (error) {
      toast.error(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
      setShowRejectDialog(false);
      setCurrentSchoolId(null);
      setIsBulkAction(false);
      form.reset();
    }
  };

  const handleViewDetails = (schoolId: string) => {
    navigate(`/data-entry?schoolId=${schoolId}&categoryId=${selectedCategoryId}`);
  };

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Təsdiqləndi":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Təsdiqləndi</span>;
      case "Rədd edildi":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rədd edildi</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Gözləmədə</span>;
    }
  };

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
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? t("hideFilters") : t("showFilters")}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportToExcel}
            disabled={isDataLoading || filteredData.length === 0}
            className="ml-2"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {t("excelExport")}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="search">{t('searchSchool')}</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t('enterSchoolName')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              {sectors.length > 0 && (
                <div>
                  <Label className="mb-2 block">{t('sectors')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {sectors.map(sector => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sector-${sector}`}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => handleSectorToggle(sector)}
                        />
                        <label
                          htmlFor={`sector-${sector}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {sector}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                {t('resetFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSchools.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-md">
          <div className="text-sm font-medium">
            {selectedSchools.length} {t('schoolsSelected')}
          </div>
          <div className="space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleBulkApprove}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              {t('approveSelected')}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleBulkReject}
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            >
              <FileX className="mr-2 h-4 w-4" />
              {t('rejectSelected')}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={deselectAllSchools}
            >
              {t('deselectAll')}
            </Button>
          </div>
        </div>
      )}

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
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={isSelectAll} 
                      onCheckedChange={handleSelectAllChange}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="font-medium min-w-[250px]">{t("schoolName")}</TableHead>
                  <TableHead className="font-medium">{t("region")}</TableHead>
                  <TableHead className="font-medium">{t("sector")}</TableHead>
                  <TableHead className="font-medium">{t("status")}</TableHead>
                  {selectedCategory?.columns.map(column => (
                    <TableHead key={column.id} className="font-medium min-w-[150px]">
                      {column.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-right min-w-[180px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedCategory?.columns.length ? selectedCategory.columns.length + 6 : 7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <h3 className="text-lg font-medium">{t("noDataAvailable")}</h3>
                        <p className="mt-2 text-sm">{t("selectAnotherCategory")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map(school => (
                    <TableRow key={school.schoolId}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedSchools.includes(school.schoolId)}
                          onCheckedChange={() => handleSchoolSelection(school.schoolId)}
                          aria-label={`Select ${school.schoolName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{school.schoolName}</TableCell>
                      <TableCell>{school.region || "-"}</TableCell>
                      <TableCell>{school.sector || "-"}</TableCell>
                      <TableCell>{getStatusBadge(school.status || "Gözləmədə")}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(school.schoolId)}
                            title={t("viewDetails")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApproveClick(school.schoolId)}
                            title={t("approve")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={school.status === "Təsdiqləndi"}
                          >
                            <FileCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejectClick(school.schoolId)}
                            title={t("reject")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={school.status === "Təsdiqləndi"}
                          >
                            <FileX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmApproval")}</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkAction 
                ? `${selectedSchools.length} məktəbin məlumatlarını təsdiqləmək istədiyinizə əminsiniz?` 
                : `Bu məktəbin məlumatlarını təsdiqləmək istədiyinizə əminsiniz?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={isSubmitting}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                t("approve")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <div>
            <Form {...form}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmRejection")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isBulkAction 
                    ? `${selectedSchools.length} məktəbin məlumatlarını rədd etmək istədiyinizə əminsiniz?` 
                    : `Bu məktəbin məlumatlarını rədd etmək istədiyinizə əminsiniz?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4">
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rejectionReason")}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t("enterRejectionReason")}
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={isSubmitting}>{t("cancel")}</AlertDialogCancel>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={form.handleSubmit(confirmReject)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    t("reject")
                  )}
                </Button>
              </AlertDialogFooter>
            </Form>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolColumnTable;
