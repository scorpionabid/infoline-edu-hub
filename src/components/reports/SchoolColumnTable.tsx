import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Edit, Copy, FileText, Download, Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ExportButtons from '@/components/reports/ExportButtons';
import PaginationControls from '@/components/reports/PaginationControls';
import { usePaginatedReports } from '@/hooks/reports/usePaginatedReports';
import { reportCache } from '@/services/reports/cacheService';
import { useCategories } from '@/hooks/useCategories';

interface SchoolColumnTableProps {
  categoryId?: string;
}

interface SchoolRow {
  school_id: string;
  school_name: string;
  principal_name?: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  total_entries: number;
  approved_entries: number;
  pending_entries: number;
  rejected_entries: number;
  approval_rate: number;
  last_submission?: string;
  status: string;
}

const SchoolColumnTable: React.FC<SchoolColumnTableProps> = ({ categoryId }) => {
  const { t } = useLanguage();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [regions, setRegions] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Get data from category columns
  const { data: categories } = useCategories();
  const category = useMemo(() => categories?.find(c => c.id === categoryId), [categories, categoryId]);

  const filters = useMemo(() => ({
    category_id: categoryId
  }), [categoryId]);

  const { data: schoolsData = [], pagination, actions } = usePaginatedReports<SchoolRow>({
    reportType: 'school_column_data',
    filters,
    config: {
      pageSize: 50,
      prefetchNextPage: true
    }
  });

  // Extract unique regions for filtering
  useEffect(() => {
    if (schoolsData.length > 0) {
      const uniqueRegions = [...new Set(schoolsData.map(school => school.region_name))];
      setRegions(uniqueRegions.sort());
    }
  }, [schoolsData]);

  // Apply client-side filters (since server-side filtering is complex)
  const filteredData = useMemo(() => {
    let filtered = schoolsData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(school => 
        school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.region_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.sector_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(school => {
        switch (statusFilter) {
          case 'high_performance':
            return school.completion_rate >= 80;
          case 'medium_performance':
            return school.completion_rate >= 50 && school.completion_rate < 80;
          case 'low_performance':
            return school.completion_rate < 50;
          case 'pending':
            return school.pending_entries > 0;
          default:
            return true;
        }
      });
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(school => school.region_name === regionFilter);
    }

    return filtered;
  }, [schoolsData, searchTerm, statusFilter, regionFilter]);

  const handleImport = async () => {
    if (!importFile || !categoryId) return;

    try {
      setIsImporting(true);
      
      // Here would be the implementation of file import logic
      // For example, using FormData to send to an API endpoint
      
      toast.success('Data imported successfully');
      setIsImportDialogOpen(false);
      setImportFile(null);
      actions.refresh(); // Refresh data after import
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (value: number) => {
    if (value >= 80) {
      return <Badge className="bg-green-500">High</Badge>;
    } else if (value >= 50) {
      return <Badge className="bg-yellow-500">Medium</Badge>;
    } else {
      return <Badge className="bg-red-500">Low</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {category?.name || 'School Data'} 
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actions.refresh}
                className="flex items-center gap-1"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <ExportButtons 
                data={filteredData}
                filename={`school-report-${categoryId || 'all'}`}
                title={category?.name || 'School Data'}
              />
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="high_performance">High performance</SelectItem>
                  <SelectItem value="medium_performance">Medium performance</SelectItem>
                  <SelectItem value="low_performance">Low performance</SelectItem>
                  <SelectItem value="pending">With pending entries</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {pagination.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredData.length === 0 ? (
            <Alert variant="default" className="bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No data found. Try changing your filters or refresh the data.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((school) => (
                      <TableRow key={school.school_id}>
                        <TableCell className="font-medium">
                          {school.school_name}
                          {school.principal_name && (
                            <div className="text-xs text-muted-foreground">
                              Principal: {school.principal_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{school.region_name}</TableCell>
                        <TableCell>{school.sector_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{school.completion_rate}%</span>
                            {getStatusBadge(school.completion_rate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              <span className="text-green-600">{school.approved_entries} approved</span>
                              {school.pending_entries > 0 && (
                                <span className="text-amber-600 ml-2">{school.pending_entries} pending</span>
                              )}
                              {school.rejected_entries > 0 && (
                                <span className="text-red-600 ml-2">{school.rejected_entries} rejected</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {school.total_entries}
                          <div className="text-xs text-muted-foreground">
                            {school.last_submission ? new Date(school.last_submission).toLocaleDateString() : 'No submissions'}
                          </div>
                        </TableCell>
                        <TableCell>{school.last_submission ? new Date(school.last_submission).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit data</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>View details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Export</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="p-2 border-t">
                <PaginationControls
                  pagination={pagination}
                  actions={actions}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="dataFile" className="text-sm font-medium">
                Select Excel File
              </label>
              <Input
                id="dataFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
              />
              <p className="text-xs text-muted-foreground">
                Please upload an Excel file with the required format
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile || isImporting}
              className="gap-2"
            >
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolColumnTable;
