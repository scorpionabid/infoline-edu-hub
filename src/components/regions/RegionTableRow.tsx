
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, UserCircle } from 'lucide-react';
import { EnhancedRegion } from '@/types/region';
import { Progress } from '@/components/ui/progress';

interface RegionTableRowProps {
  region: EnhancedRegion;
  t: (key: string) => string;
  onView: (region: EnhancedRegion) => void;
  onEdit: (region: EnhancedRegion) => void;
  onDelete: (region: EnhancedRegion) => void;
}

const RegionTableRow: React.FC<RegionTableRowProps> = ({
  region,
  t,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow key={region.id}>
      <TableCell className="font-medium">{region.name}</TableCell>
      <TableCell>{region.description || '-'}</TableCell>
      <TableCell className="text-center">
        <Badge 
          variant={region.status === 'active' ? "default" : "secondary"} 
          className="justify-center w-20"
        >
          {region.status === 'active' ? t('active') : t('inactive')}
        </Badge>
      </TableCell>
      <TableCell className="text-center">{region.sectorCount}</TableCell>
      <TableCell className="text-center">{region.schoolCount}</TableCell>
      <TableCell>
        {region.adminEmail ? (
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate max-w-[150px]" title={region.adminEmail}>
              {region.adminEmail}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t('noAdmin')}</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col space-y-1">
          <Progress value={region.completionRate} className="h-2" />
          <span className="text-xs">{region.completionRate}%</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onView(region)}
            title={t('viewDetails')}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">{t('viewDetails')}</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(region)}
            title={t('edit')}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t('edit')}</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(region)}
            title={t('delete')}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t('delete')}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RegionTableRow;
