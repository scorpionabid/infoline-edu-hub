
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Pencil } from 'lucide-react';
import { EnhancedRegion } from '@/types/region';

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
  onDelete,
}) => (
  <TableRow>
    <TableCell className="font-mono text-xs truncate">
      {region.id?.split('-')?.[0] || ''}...
    </TableCell>
    <TableCell className="font-medium">{region.name}</TableCell>
    <TableCell className="text-center">
      <Badge variant="outline">{region.sectorCount || 0}</Badge>
    </TableCell>
    <TableCell className="text-center">
      <Badge variant="outline">{region.schoolCount || 0}</Badge>
    </TableCell>
    <TableCell className="max-w-[180px] truncate">
      {/* Admin email sütunu - debug məlumatları əlavə edildi */}
      {console.log('RegionTableRow - region:', region.name, 'adminEmail:', region.adminEmail)}
      {region.adminEmail ? (
        <a 
          href={`mailto:${region.adminEmail}`}
          className="text-blue-500 hover:underline text-sm"
          title={region.adminEmail}
        >
          {region.adminEmail}
        </a>
      ) : (
        <span className="text-gray-400 text-sm">{t('adminNotAssigned')}</span>
      )}
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
        <Button 
          variant="outline" 
          size="icon" 
          title={t('viewDetails')}
          onClick={() => onView(region)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          title={t('edit')}
          onClick={() => onEdit(region)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          title={t('delete')}
          onClick={() => onDelete(region)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default RegionTableRow;
