
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useDataEntries } from '@/hooks/useDataEntries';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';
import DataEntryHeader from '@/components/dataEntry/DataEntryHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, FileSpreadsheet, InfoIcon, LayoutGrid, Loader2 } from 'lucide-react';
import { exportDataToExcel } from '@/utils/excelExport';
import type { DataEntry } from '@/types/dataEntry';

// Adapter funksiyası əlavə edildi
const adaptDataForExport = (entries: DataEntry[]) => {
  return entries.map(entry => ({
    id: entry.id!,
    category_id: entry.category_id,
    column_id: entry.column_id,
    school_id: entry.school_id, 
    value: entry.value || '',
    status: entry.status as 'pending' | 'approved' | 'rejected',
    errorMessage: entry.rejection_reason || ''
  }));
};

const DataEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("form");

  const {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    approveEntry,
    rejectEntry,
    submitCategoryForApproval,
    getApprovalStatus
  } = useDataEntries();

  useEffect(() => {
    const categoryId = searchParams.get("category");
    if (categoryId) {
      setCategoryFilter(categoryId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      console.error('Məlumatları əldə edərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadData')
      });
    }
  }, [error, t]);

  const stats = React.useMemo(() => {
    return {
      totalEntries: entries.length,
      pendingEntries: entries.filter(entry => entry.status === 'pending').length,
      approvedEntries: entries.filter(entry => entry.status === 'approved').length,
      rejectedEntries: entries.filter(entry => entry.status === 'rejected').length,
      completionRate: entries.length > 0 ? 
        Math.round((entries.filter(entry => entry.status === 'approved').length / entries.length) * 100) : 0
    };
  }, [entries]);

  const handleExportData = () => {
    if (entries && entries.length > 0) {
      const exportableEntries = adaptDataForExport(entries);
      exportDataToExcel(exportableEntries);
    } else {
      toast.warning(t('noDataToExport'));
    }
  };

  const MinimalisticStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.totalEntries}</div>
          <p className="text-gray-400">Ümumi məlumatlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.pendingEntries}</div>
          <p className="text-gray-400">Gözləyən məlumatlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.approvedEntries}</div>
          <p className="text-gray-400">Təsdiqlənmiş məlumatlar</p>
        </CardContent>
      </Card>
      <Card className="border-0 bg-black text-white">
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <div className="text-4xl font-bold mb-2">{loading ? "..." : `${stats.completionRate}%`}</div>
          <Progress value={loading ? 0 : stats.completionRate} className="w-4/5 mt-2" />
          <p className="text-gray-400 mt-2">Tamamlanma</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <DataEntryHeader
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportData={handleExportData}
        />

        <MinimalisticStats />

        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="form">
              <Database className="h-4 w-4 mr-2" />
              Məlumat forması
            </TabsTrigger>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Məlumat şəbəkəsi
            </TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <DataEntryForm 
              categoryId={categoryFilter !== "all" ? categoryFilter : undefined}
              statusFilter={statusFilter !== "all" ? statusFilter : undefined}
            />
          </TabsContent>
          <TabsContent value="grid">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <InfoIcon className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-medium">{t("errorLoadingData")}</h3>
                <p className="text-muted-foreground">{t("tryAgainLater")}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">{t("noDataFound")}</h3>
                <p className="text-muted-foreground">{t("useFormToAddData")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Məlumat şəbəkəsi</h3>
                    <p className="text-muted-foreground">Bu bölmə hazırlanır...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default DataEntry;
