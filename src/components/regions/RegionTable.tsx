
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable, { Column } from '@/components/common/DataTable';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  FileText, 
  School, 
  Mail, 
  BarChart3,
  Building
} from 'lucide-react';

interface RegionTableProps {
  regions: EnhancedRegion[];
  loading: boolean;
  onEdit: (region: EnhancedRegion) => void;
  onDelete: (id: string) => void;
}

const RegionTable: React.FC<RegionTableProps> = ({
  regions,
  loading,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'blocked':
        return <Badge variant="destructive">{t('blocked')}</Badge>;
      default:
        return <Badge>{t('unknown')}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'name',
      header: t('regionName'),
      cell: (region) => <span className="font-medium">{region.name}</span>
    },
    {
      key: 'description',
      header: t('description'),
      cell: (region) => <span className="text-muted-foreground">{region.description || '-'}</span>
    },
    {
      key: 'admin',
      header: t('regionAdmin'),
      cell: (region) => (
        <div className="flex items-center">
          {region.adminEmail ? (
            <>
              <Mail className="h-4 w-4 mr-2 text-blue-500" />
              <span>{region.adminEmail}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'sectorCount',
      header: t('sectorCount'),
      cell: (region) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 mr-2 text-purple-500" />
          <span>{region.sectorCount || 0}</span>
        </div>
      )
    },
    {
      key: 'schoolCount',
      header: t('schoolCount'),
      cell: (region) => (
        <div className="flex items-center">
          <School className="h-4 w-4 mr-2 text-orange-500" />
          <span>{region.schoolCount || 0}</span>
        </div>
      )
    },
    {
      key: 'completionRate',
      header: t('completionRate'),
      cell: (region) => (
        <div className="flex items-center">
          <BarChart3 className="h-4 w-4 mr-2 text-green-500" />
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${region.completionRate || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{region.completionRate || 0}%</span>
        </div>
      )
    },
    {
      key: 'status',
      header: t('status'),
      cell: (region) => getStatusBadge(region.status)
    }
  ];

  return (
    <DataTable
      data={regions}
      columns={columns}
      isLoading={loading}
      isError={false}
      emptyState={{
        icon: <FileText className="h-10 w-10 text-muted-foreground" />,
        title: t('noRegionsFound'),
        description: t('noRegionsFoundDesc')
      }}
      actionColumn={{
        canManage: true,
        actions: [
          {
            icon: <Edit className="h-4 w-4 mr-2" />,
            label: t('edit'),
            onClick: (region) => onEdit(region)
          },
          {
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            label: t('delete'),
            onClick: (region) => setItemToDelete(region.id),
            variant: "destructive"
          }
        ]
      }}
      deleteDialog={{
        title: t('deleteRegion'),
        description: t('deleteRegionConfirmation'),
        itemToDelete: itemToDelete,
        setItemToDelete: setItemToDelete,
        onDelete: async (id) => {
          onDelete(id);
          return true;
        }
      }}
    />
  );
};

export default RegionTable;
