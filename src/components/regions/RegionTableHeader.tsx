
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoveUpRight, MoveDown } from 'lucide-react';

interface RegionTableHeaderProps {
  t: (key: string) => string;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  handleSort: (key: string) => void;
}

const RegionTableHeader: React.FC<RegionTableHeaderProps> = ({ 
  t, 
  sortConfig, 
  handleSort 
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <MoveUpRight className="h-4 w-4" /> : <MoveDown className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[200px] cursor-pointer"
          onClick={() => handleSort('name')}
        >
          <div className="flex items-center gap-2">
            {t('name')}
            {getSortIcon('name')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('description')}
        >
          <div className="flex items-center gap-2">
            {t('description')}
            {getSortIcon('description')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-24 text-center"
          onClick={() => handleSort('status')}
        >
          <div className="flex items-center gap-2">
            {t('status')}
            {getSortIcon('status')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-24 text-center"
          onClick={() => handleSort('sectorCount')}
        >
          <div className="flex items-center gap-2">
            {t('sectors')}
            {getSortIcon('sectorCount')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-24 text-center"
          onClick={() => handleSort('schoolCount')}
        >
          <div className="flex items-center gap-2">
            {t('schools')}
            {getSortIcon('schoolCount')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-44"
          onClick={() => handleSort('adminEmail')}
        >
          <div className="flex items-center gap-2">
            {t('admin')}
            {getSortIcon('adminEmail')}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-24 text-center"
          onClick={() => handleSort('completionRate')}
        >
          <div className="flex items-center gap-2">
            {t('completion')}
            {getSortIcon('completionRate')}
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-right">{t('actions')}</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default RegionTableHeader;
