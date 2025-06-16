import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronDown, 
  Trash2, 
  Eye, 
  EyeOff, 
  FolderInput,
  X,
  Loader2
} from 'lucide-react';
import { Column } from '@/types/column';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';

interface BulkOperationsPanelProps {
  selectedColumns: string[];
  columns: Column[];
  categories: Category[];
  isLoading?: boolean;
  onBulkDelete?: (columnIds: string[]) => Promise<boolean>;
  onBulkToggleStatus?: (columnIds: string[], status: 'active' | 'inactive') => Promise<boolean>;
  onBulkMoveToCategory?: (columnIds: string[], categoryId: string) => Promise<boolean>;
  onClearSelection?: () => void;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedColumns,
  columns,
  categories,
  isLoading,
  onBulkDelete,
  onBulkToggleStatus,
  onBulkMoveToCategory,
  onClearSelection
}) => {
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [operationLoading, setOperationLoading] = useState(false);

  if (selectedColumns.length === 0) {
    return null;
  }

  const selectedColumnsData = columns.filter(col => selectedColumns.includes(col.id));
  const activeColumnsCount = selectedColumnsData.filter(col => col.status === 'active').length;
  const inactiveColumnsCount = selectedColumnsData.filter(col => col.status === 'inactive').length;

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    setOperationLoading(true);
    try {
      const success = await onBulkDelete(selectedColumns);
      if (success) {
        onClearSelection?.();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkToggleStatus = async (status: 'active' | 'inactive') => {
    if (!onBulkToggleStatus) return;
    
    setOperationLoading(true);
    try {
      const success = await onBulkToggleStatus(selectedColumns, status);
      if (success) {
        onClearSelection?.();
      }
    } catch (error) {
      console.error('Bulk toggle status error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkMoveToCategory = async () => {
    if (!onBulkMoveToCategory || !selectedCategoryId) return;
    
    setOperationLoading(true);
    try {
      const success = await onBulkMoveToCategory(selectedColumns, selectedCategoryId);
      if (success) {
        onClearSelection?.();
        setMoveDialogOpen(false);
        setSelectedCategoryId('');
      }
    } catch (error) {
      console.error('Bulk move to category error:', error);
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {selectedColumns.length} sütun seçildi
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {activeColumnsCount > 0 && (
                <span className="mr-3">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {activeColumnsCount} aktiv
                  </Badge>
                </span>
              )}
              {inactiveColumnsCount > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {inactiveColumnsCount} deaktiv
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bulk Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading || operationLoading}>
                  {operationLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Toplu əməliyyatlar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Status toggle options */}
                {activeColumnsCount > 0 && (
                  <DropdownMenuItem 
                    onClick={() => handleBulkToggleStatus('inactive')}
                    disabled={operationLoading}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Aktiv sütunları deaktivləşdir ({activeColumnsCount})
                  </DropdownMenuItem>
                )}
                {inactiveColumnsCount > 0 && (
                  <DropdownMenuItem 
                    onClick={() => handleBulkToggleStatus('active')}
                    disabled={operationLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Deaktiv sütunları aktivləşdir ({inactiveColumnsCount})
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {/* Move to category */}
                <DropdownMenuItem 
                  onClick={() => setMoveDialogOpen(true)}
                  disabled={operationLoading}
                >
                  <FolderInput className="h-4 w-4 mr-2" />
                  Kateqoriyaya köçür
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Delete */}
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                  disabled={operationLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Seçilmişləri sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Selection */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              disabled={operationLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Toplu silmə təsdiqi
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedColumns.length} sütunu</strong> silmək istədiyinizə əminsiniz?
              <div className="mt-2 text-sm text-muted-foreground">
                Bu əməliyyat sütunları arxivə köçürəcək və onları sonradan bərpa etmək mümkün olacaq.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading}>
              Ləğv et
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={operationLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {operationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Silinir...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to Category Dialog */}
      <AlertDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FolderInput className="h-5 w-5 text-blue-600" />
              Kateqoriyaya köçürmə
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedColumns.length} sütunu</strong> hansı kateqoriyaya köçürmək istəyirsiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading}>
              Ləğv et
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkMoveToCategory}
              disabled={operationLoading || !selectedCategoryId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {operationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Köçürülür...
                </>
              ) : (
                <>
                  <FolderInput className="mr-2 h-4 w-4" />
                  Köçür
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperationsPanel;
