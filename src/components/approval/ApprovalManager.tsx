
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import ApprovalActionDialog from './ApprovalActionDialog';
import ApprovalStatusBadge from './ApprovalStatusBadge';
import ApprovalFilters from './ApprovalFilters';
import ApprovalDetails from './ApprovalDetails';
import { useApprovalActions } from '@/hooks/approval/useApprovalActions';

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: DataEntryStatus;
  entries: DataEntry[];
  completionRate: number;
}

interface ApprovalManagerProps {
  pendingApprovals: ApprovalItem[];
  approvedItems: ApprovalItem[];
  rejectedItems: ApprovalItem[];
  onApprove: (itemId: string, comment?: string) => Promise<void>;
  onReject: (itemId: string, reason: string) => Promise<void>;
  onView: (item: ApprovalItem) => void;
  isLoading?: boolean;
}

const ApprovalManager: React.FC<ApprovalManagerProps> = ({
  pendingApprovals,
  approvedItems,
  rejectedItems,
  onApprove,
  onReject,
  onView,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const { approveItem, rejectItem, batchApprove, isProcessing } = useApprovalActions();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  
  // State for dialogs
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    itemId: string;
    itemTitle: string;
  }>({
    isOpen: false,
    action: 'approve',
    itemId: '',
    itemTitle: ''
  });
  
  const [detailsDialog, setDetailsDialog] = useState<{
    isOpen: boolean;
    item: ApprovalItem | null;
  }>({
    isOpen: false,
    item: null
  });

  // State for selections
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('pending');

  // Get current items based on active tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'pending':
        return pendingApprovals;
      case 'approved':
        return approvedItems;
      case 'rejected':
        return rejectedItems;
      default:
        return pendingApprovals;
    }
  };

  // Filter items based on search and filters
  const getFilteredItems = () => {
    let items = getCurrentItems();

    if (searchTerm) {
      items = items.filter(item =>
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      items = items.filter(item => item.categoryId === categoryFilter);
    }

    if (schoolFilter && schoolFilter !== 'all') {
      items = items.filter(item => item.schoolId === schoolFilter);
    }

    return items;
  };

  // Handle single approval
  const handleApprove = useCallback((itemId: string, itemTitle: string) => {
    setActionDialog({
      isOpen: true,
      action: 'approve',
      itemId,
      itemTitle
    });
  }, []);

  // Handle single rejection
  const handleReject = useCallback((itemId: string, itemTitle: string) => {
    setActionDialog({
      isOpen: true,
      action: 'reject',
      itemId,
      itemTitle
    });
  }, []);

  // Handle action confirmation
  const handleActionConfirm = useCallback(async (comment?: string) => {
    const { action, itemId } = actionDialog;
    
    if (action === 'approve') {
      await onApprove(itemId, comment);
    } else {
      await onReject(itemId, comment || '');
    }
    
    setActionDialog(prev => ({ ...prev, isOpen: false }));
  }, [actionDialog, onApprove, onReject]);

  // Handle view details
  const handleViewDetails = useCallback((item: ApprovalItem) => {
    setDetailsDialog({
      isOpen: true,
      item
    });
  }, []);

  // Handle batch operations
  const handleBatchApprove = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    const itemIds = Array.from(selectedItems);
    await batchApprove(itemIds);
    setSelectedItems(new Set());
  }, [selectedItems, batchApprove]);

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSchoolFilter('all');
  }, []);

  // Reset selections when tab changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [activeTab]);

  const filteredItems = getFilteredItems();

  // Extract categories and schools for filters
  const categories = Array.from(
    new Set([...pendingApprovals, ...approvedItems, ...rejectedItems]
      .map(item => ({ id: item.categoryId, name: item.categoryName }))
    )
  );

  const schools = Array.from(
    new Set([...pendingApprovals, ...approvedItems, ...rejectedItems]
      .map(item => ({ id: item.schoolId, name: item.schoolName }))
    )
  );

  const renderApprovalItem = (item: ApprovalItem) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <Card key={item.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {activeTab === 'pending' && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItemSelection(item.id)}
                  className="mt-1"
                />
              )}
              <div>
                <CardTitle className="text-lg">{item.categoryName}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.schoolName}</p>
                <p className="text-xs text-muted-foreground">
                  {t('submittedBy')}: {item.submittedBy} • {new Date(item.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ApprovalStatusBadge status={item.status} />
              <span className="text-sm font-medium">{Math.round(item.completionRate)}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {item.entries?.length || 0} {t('dataEntries')}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(item)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {t('view')}
              </Button>
              
              {item.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(item.id, `${item.categoryName} - ${item.schoolName}`)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {t('reject')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item.id, `${item.categoryName} - ${item.schoolName}`)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('approve')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ApprovalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        schoolFilter={schoolFilter}
        onSchoolFilterChange={setSchoolFilter}
        onClearFilters={clearFilters}
        categories={categories}
        schools={schools}
        isCollapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
      />

      {/* Batch actions for pending items */}
      {activeTab === 'pending' && pendingApprovals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedItems.size} / {filteredItems.length} {t('selected')}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedItems(new Set(filteredItems.map(item => item.id)))}
                  >
                    {t('selectAll')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedItems(new Set())}
                  >
                    {t('clearSelection')}
                  </Button>
                </div>
              </div>
              
              {selectedItems.size > 0 && (
                <Button
                  size="sm"
                  onClick={handleBatchApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t('approveSelected')} ({selectedItems.size})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('pending')} ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('approved')} ({approvedItems.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {t('rejected')} ({rejectedItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{searchTerm || categoryFilter !== 'all' || schoolFilter !== 'all' 
                  ? t('noMatchingPendingApprovals') 
                  : t('noPendingApprovals')
                }</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(renderApprovalItem)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{searchTerm || categoryFilter !== 'all' || schoolFilter !== 'all'
                  ? t('noMatchingApprovedItems')
                  : t('noApprovedItems')
                }</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(renderApprovalItem)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{searchTerm || categoryFilter !== 'all' || schoolFilter !== 'all'
                  ? t('noMatchingRejectedItems')
                  : t('noRejectedItems')
                }</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(renderApprovalItem)
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <ApprovalActionDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleActionConfirm}
        action={actionDialog.action}
        itemTitle={actionDialog.itemTitle}
        isLoading={isProcessing}
      />

      {/* Details Dialog */}
      <ApprovalDetails
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, item: null })}
        item={detailsDialog.item}
      />
    </div>
  );
};

export default ApprovalManager;
