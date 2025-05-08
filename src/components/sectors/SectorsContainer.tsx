
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, School } from 'lucide-react';
import { EnhancedSector } from '@/types/supabase';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { formatDate } from '@/utils/date';

interface SectorsContainerProps {
  isLoading?: boolean;
}

const SectorsContainer: React.FC<SectorsContainerProps> = ({ isLoading = false }) => {
  const { t } = useLanguage();
  const { sectors } = useSectorsStore();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const [filteredSectors, setFilteredSectors] = useState<EnhancedSector[]>([]);
  
  // Sektorların lokallaşdırılması və filterlənməsi
  useEffect(() => {
    if (sectors) {
      setFilteredSectors(sectors as EnhancedSector[]);
    }
  }, [sectors]);

  // Yükləmə skeleti
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  // Heç bir sektor yoxdursa
  if (!filteredSectors.length) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl font-bold text-muted-foreground mb-2">🏫</div>
        <h3 className="text-lg font-semibold mb-2">{t('noSectorsFound')}</h3>
        <p className="text-muted-foreground mb-4">{t('noSectorsFoundDesc')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('region')}</TableHead>
            <TableHead>{t('schoolsCount')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell>{sector.region_name || t('notAssigned')}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <School className="h-4 w-4 mr-1" />
                  {t('viewSchools')}
                </Button>
              </TableCell>
              <TableCell>
                <Badge variant={sector.status === 'active' ? 'default' : 'secondary'}>
                  {sector.status === 'active' ? t('active') : t('inactive')}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={t('editSector')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon" 
                  className="h-8 w-8"
                  title={t('assignAdmin')}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                {(isSuperAdmin || isRegionAdmin) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title={t('deleteSector')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectorsContainer;
