
import React from 'react';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ColumnList from './ColumnList';
import ColumnTabs from './ColumnTabs';
import { Input } from '@/components/ui/input';

interface ColumnsContainerProps {
  columns?: Column[];
  categories?: Category[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreate?: () => void;
  onEdit?: (column: Column) => void;
  onDelete?: (id: string, name: string) => void;
  onRestore?: (id: string, name: string) => void; // NEW: Restore deleted columns
}

const ColumnsContainer: React.FC<ColumnsContainerProps> = ({
  columns = [],
  categories = [],
  isLoading = false,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onRestore // NEW: Restore handler
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Separate active and archived columns
  const activeColumns = React.useMemo(() => {
    return columns?.filter(column => column.status === 'active') || [];
  }, [columns]);
  
  const archivedColumns = React.useMemo(() => {
    return columns?.filter(column => column.status === 'deleted') || [];
  }, [columns]);
  
  // Get current columns based on active tab
  const currentColumns = activeTab === 'active' ? activeColumns : archivedColumns;
  
  // Filter columns
  const filteredColumns = React.useMemo(() => {
    if (!currentColumns || !Array.isArray(currentColumns)) return [];
    
    return currentColumns.filter(column => {
      const matchesSearch = searchQuery === '' || 
        column.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [currentColumns, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('loadingColumns') || 'Loading columns...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('columns')}</h1>
          <p className="text-muted-foreground">{t('manageDataColumns')}</p>
        </div>
        <Button onClick={() => onCreate && onCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createColumn')}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder={t('searchColumns') || 'Search columns...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={onRefresh}>
          {t('refresh')}
        </Button>
      </div>

      <ColumnTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeColumns.length}
        archivedCount={archivedColumns.length}
      />

      <ColumnList
        columns={filteredColumns}
        categories={categories}
        onEditColumn={onEdit}
        onDeleteColumn={onDelete}
        onRestoreColumn={onRestore} // NEW: Pass restore handler
        canManageColumns={true}
      />
    </div>
  );
};

export default ColumnsContainer;
