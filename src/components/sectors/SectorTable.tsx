
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable, { Column } from '@/components/common/DataTable';
import { EnhancedSector } from '@/hooks/useSectorsStore';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  FileText, 
  School, 
  Mail, 
  Building,
  MapPin,
  UserPlus
} from 'lucide-react';

interface SectorTableProps {
  sectors: EnhancedSector[];
  loading: boolean;
  onEdit: (sector: EnhancedSector) => void;
  onDelete: (id: string) => void;
  onAssignAdmin: (sector: EnhancedSector) => void;
}

const SectorTable: React.FC<SectorTableProps> = ({
  sectors,
  loading,
  onEdit,
  onDelete,
  onAssignAdmin
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
      header: t('sectorName'),
      cell: (sector) => <span className="font-medium">{sector.name}</span>
    },
    {
      key: 'description',
      header: t('description'),
      cell: (sector) => <span className="text-muted-foreground">{sector.description || '-'}</span>
    },
    {
      key: 'regionName',
      header: t('region'),
      cell: (sector) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          <span>{sector.regionName || '-'}</span>
        </div>
      )
    },
    {
      key: 'admin',
      header: t('sectorAdmin'),
      cell: (sector) => (
        <div className="flex items-center">
          {sector.admin_email ? (
            <>
              <Mail className="h-4 w-4 mr-2 text-blue-500" />
              <span>{sector.admin_email}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'schoolCount',
      header: t('schoolCount'),
      cell: (sector) => (
        <div className="flex items-center">
          <School className="h-4 w-4 mr-2 text-orange-500" />
          <span>{sector.schoolCount || 0}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: t('status'),
      cell: (sector) => getStatusBadge(sector.status)
    }
  ];

  return (
    <DataTable
      data={sectors}
      columns={columns}
      isLoading={loading}
      isError={false}
      emptyState={{
        icon: <FileText className="h-10 w-10 text-muted-foreground" />,
        title: t('noSectorsFound'),
        description: t('noSectorsFoundDesc')
      }}
      actionColumn={{
        canManage: true,
        actions: [
          {
            icon: <Edit className="h-4 w-4 mr-2" />,
            label: t('edit'),
            onClick: (sector) => onEdit(sector)
          },
          {
            icon: <UserPlus className="h-4 w-4 mr-2" />,
            label: t('assignAdmin'),
            onClick: (sector) => onAssignAdmin(sector),
            isHidden: (sector) => !!sector.admin_email
          },
          {
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            label: t('delete'),
            onClick: (sector) => setItemToDelete(sector.id),
            variant: "destructive"
          }
        ]
      }}
      deleteDialog={{
        title: t('deleteSector'),
        description: t('deleteSectorConfirmation'),
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

export default SectorTable;
