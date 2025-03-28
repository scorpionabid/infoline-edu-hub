
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegionsStore, EnhancedRegion } from '@/hooks/useRegionsStore';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, Trash2, Pencil, RefreshCw, PlusCircle, Search } from 'lucide-react';
import AddRegionDialog from '@/components/regions/AddRegionDialog';
import DeleteRegionDialog from '@/components/regions/DeleteRegionDialog';
import { Badge } from '@/components/ui/badge';

const Regions: React.FC = () => {
  const { t } = useLanguage();
  const {
    regions,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddRegion,
    handleDeleteRegion,
    fetchRegions
  } = useRegionsStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<EnhancedRegion | null>(null);

  const handleRegionDelete = (region: EnhancedRegion) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('regions')}</h1>
          <p className="text-muted-foreground">{t('regionsDescription')}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('addRegion')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('manageRegions')}</CardTitle>
          <CardDescription>{t('manageRegionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchRegions')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select 
              value={selectedStatus || ''} 
              onValueChange={(value) => handleStatusFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allStatuses')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={!searchTerm && !selectedStatus}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('resetFilters')}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">{t('id')}</TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort('name')}
                  >
                    {t('name')} {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort('sectorCount')}
                  >
                    {t('sectors')} {sortConfig.key === 'sectorCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('schoolCount')}
                  >
                    {t('schools')} {sortConfig.key === 'schoolCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>{t('admin')}</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('completionRate')}
                  >
                    {t('completion')} {sortConfig.key === 'completionRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    {t('status')} {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 h-[200px]">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                        <span className="text-muted-foreground">{t('loadingRegions')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : regions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 h-[200px]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-muted-foreground mb-2">{t('noRegionsFound')}</span>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="mt-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> {t('addRegion')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-mono text-xs truncate">
                        {region.id.split('-')[0]}...
                      </TableCell>
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{region.sectorCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{region.schoolCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        <a 
                          href={`mailto:${region.adminEmail}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          {region.adminEmail}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            region.completionRate >= 80 ? "bg-green-500" : 
                            region.completionRate >= 50 ? "bg-amber-500" : 
                            "bg-red-500"
                          }
                        >
                          {region.completionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.status === 'active' ? 'default' : 'secondary'}>
                          {region.status === 'active' ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" title={t('viewDetails')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title={t('edit')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            title={t('delete')}
                            onClick={() => handleRegionDelete(region)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('previous')}
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddRegionDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddRegion}
      />

      <DeleteRegionDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        region={selectedRegion}
        onDelete={handleDeleteRegion}
      />
    </div>
  );
};

export default Regions;
