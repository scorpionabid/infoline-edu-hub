
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  handleSort,
}) => (
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
);

export default RegionTableHeader;
