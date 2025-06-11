
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from '@/components/ui/data-table';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { ExportButtons } from '@/components/ui/export-buttons';

interface EnhancedSchoolColumnTableProps {
  categoryId?: string;
}

const EnhancedSchoolColumnTable: React.FC<EnhancedSchoolColumnTableProps> = ({
  categoryId
}) => {
  const { t } = useLanguage();
  const [schools, setSchools] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tableColumns, setTableColumns] = useState([]);

  const {
    userRole,
    loading: roleLoading,
    error: roleError,
    getSchoolPerformanceReport,
    getPermissionsSummary
  } = useRoleBasedReports();

  const permissions = getPermissionsSummary();

  // Fetch data and columns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = applyPermissionsToFilters({
          region_id: selectedRegion || undefined,
          sector_id: selectedSector || undefined,
          search: searchQuery
        });
        
        const reportData = await getSchoolPerformanceReport(filters);
        setSchools(reportData || []);
        setColumns([]);
      } catch (err: any) {
        setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, selectedRegion, selectedSector, searchQuery, getSchoolPerformanceReport, permissions]);

  const applyPermissionsToFilters = useCallback((baseFilters: any) => {
    const updatedFilters = {
      search: '',
      ...baseFilters
    };

    if (permissions?.restrictions.region_id) {
      updatedFilters.region_id = permissions.restrictions.region_id;
      updatedFilters.sector_id = undefined;
    }

    if (permissions?.restrictions.sector_id) {
      updatedFilters.sector_id = permissions.restrictions.sector_id;
    }

    return updatedFilters;
  }, [permissions]);

  // Generate table columns
  useEffect(() => {
    const generatedColumns = generateTableColumns(columns);
    setTableColumns(generatedColumns);
  }, [columns, t]);

  const generateTableColumns = useCallback((columns: any[]) => {
    const baseColumns = [
      {
        accessorKey: 'school_name',
        header: t('school'),
        cell: ({ row }) => <div className="w-[200px]">{row.getValue('school_name')}</div>,
        size: 200,
      },
      {
        accessorKey: 'region_name',
        header: t('region'),
        cell: ({ row }) => row.getValue('region_name'),
        size: 150,
      },
      {
        accessorKey: 'sector_name',
        header: t('sector'),
        cell: ({ row }) => row.getValue('sector_name'),
        size: 150,
      },
      {
        accessorKey: 'completion_rate',
        header: t('completionRate'),
        cell: ({ row }) => `${row.getValue('completion_rate')}%`,
        size: 100,
      }
    ];

    return baseColumns;
  }, [t]);

  const handleExport = async (format: string) => {
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('schoolColumnReportTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Label htmlFor="search">Axtar:</Label>
              <Input
                id="search"
                type="search"
                placeholder="Məktəb adı ilə axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Region Filter */}
            <div>
              <Label htmlFor="region">Region:</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Bütün Regionlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün Regionlar</SelectItem>
                  <SelectItem value="baki">Bakı</SelectItem>
                  <SelectItem value="gence">Gəncə</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div>
              <Label htmlFor="sector">Sektor:</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Bütün Sektorlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün Sektorlar</SelectItem>
                  <SelectItem value="tech">Texnologiya</SelectItem>
                  <SelectItem value="education">Təhsil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <ExportButtons 
          onExportExcel={() => handleExport('excel')}
          onExportPDF={() => handleExport('pdf')}
          onExportCSV={() => handleExport('csv')}
          isLoading={false}
        />
      </div>

      <ScrollArea>
        <div className="w-full">
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <DataTable columns={tableColumns} data={schools} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedSchoolColumnTable;
