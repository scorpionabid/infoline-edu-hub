
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/sector';

interface SectorTableProps {
  loading: boolean;
  sectors: Sector[];
  currentPage: number;
  pageSize: number;
  onEdit: (sector: Sector) => void;
  onDelete: (sector: Sector) => void;
  onSort: (key: string) => void;
  searchTerm: string;
  selectedStatus: string | null;
}

const SectorTable: React.FC<SectorTableProps> = ({
  loading,
  sectors,
  currentPage,
  pageSize,
  onEdit,
  onDelete,
  onSort,
  searchTerm,
  selectedStatus,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
              onClick={() => onSort('name')}
            >
              {t('name')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
              onClick={() => onSort('regionName')}
            >
              {t('regionName')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
              onClick={() => onSort('adminEmail')}
            >
              {t('sectorAdmin')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
              onClick={() => onSort('schoolCount')}
            >
              {t('schoolCount')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
              onClick={() => onSort('completionRate')}
            >
              {t('completionRate')}
            </TableHead>
            <TableHead className="text-center">{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array(5).fill(null).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))
          ) : sectors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                {searchTerm || selectedStatus ? 
                  t('noSectorsMatchingFilters') :
                  t('noSectorsYet')}
              </TableCell>
            </TableRow>
          ) : (
            sectors.map((sector, index) => (
              <TableRow 
                key={sector.id}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>{sector.name}</TableCell>
                <TableCell>{sector.regionName}</TableCell>
                <TableCell>{sector.adminEmail || t('noAdmin')}</TableCell>
                <TableCell className="text-center">{sector.schoolCount || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (sector.completionRate || 0) > 80 
                            ? 'bg-green-500' 
                            : (sector.completionRate || 0) > 30 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${sector.completionRate || 0}%` }}
                      />
                    </div>
                    <span className="text-xs">{sector.completionRate || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={sector.status === 'active' ? 'success' : 'destructive'}
                  >
                    {sector.status === 'active' ? t('active') : t('inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(sector)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t('edit')}</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(sector)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('delete')}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectorTable;
