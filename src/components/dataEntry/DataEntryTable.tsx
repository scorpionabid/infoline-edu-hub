import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import { DataEntryTableData } from '@/types/dataEntry';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryTableProps {
  entries: DataEntryTableData[];
}

const DataEntryTable: React.FC<DataEntryTableProps> = ({ entries }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{t('approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>;
      case 'pending':
        return <Badge variant="outline">{t('pending')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('draft')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('field')}</TableHead>
            <TableHead>{t('value')}</TableHead>
            <TableHead>{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                {t('noData')}
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry, idx) => (
              <TableRow key={`${entry.columnId}-${idx}`}>
                <TableCell className="font-medium">{entry.columnName}</TableCell>
                <TableCell>
                  {entry.columnType === 'number' ? (
                    <span className="font-mono">{entry.value}</span>
                  ) : entry.columnType === 'boolean' ? (
                    entry.value === 'true' ? t('yes') : t('no')
                  ) : entry.value || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataEntryTable;
