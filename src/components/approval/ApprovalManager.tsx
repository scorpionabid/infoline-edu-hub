
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/category';

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
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('pending');

  // Handle single approval
  const handleSingleApproval = useCallback(async (itemId: string) => {
    try {
      await onApprove(itemId);
      toast({
        title: t('success'),
        description: t('itemApprovedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorApprovingItem'),
        variant: 'destructive'
      });
    }
  }, [onApprove, t, toast]);

  // Handle single rejection
  const handleSingleRejection = useCallback(async (itemId: string, reason: string) => {
    try {
      await onReject(itemId, reason);
      toast({
        title: t('success'),
        description: t('itemRejectedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorRejectingItem'),
        variant: 'destructive'
      });
    }
  }, [onReject, t, toast]);

  // Handle batch approval
  const handleBatchApproval = useCallback(async () => {
    try {
      const promises = Array.from(selectedItems).map(itemId => onApprove(itemId));
      await Promise.all(promises);
      setSelectedItems(new Set());
      toast({
        title: t('success'),
        description: t('itemsApprovedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorApprovingItems'),
        variant: 'destructive'
      });
    }
  }, [selectedItems, onApprove, t, toast]);

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

  // Select all items
  const selectAllItems = useCallback(() => {
    setSelectedItems(new Set(pendingApprovals.map(item => item.id)));
  }, [pendingApprovals]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Render approval item
  const renderApprovalItem = (item: ApprovalItem) => {
    const isSelected = selectedItems.has(item.id);
    const statusColor = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      draft: 'bg-gray-500'
    }[item.status] || 'bg-gray-500';

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
              <Badge className={statusColor}>
                {item.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                {item.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                {item.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                {t(item.status)}
              </Badge>
              <span className="text-sm font-medium">{Math.round(item.completionRate)}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {item.entries.length} {t('dataEntries')}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(item)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {t('view')}
              </Button>
              
              {item.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSingleRejection(item.id, 'Manual rejection')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {t('reject')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSingleApproval(item.id)}
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
      {/* Header with batch actions */}
      {activeTab === 'pending' && pendingApprovals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedItems.size} / {pendingApprovals.length} {t('selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllItems}>
                    {t('selectAll')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    {t('clearSelection')}
                  </Button>
                </div>
              </div>
              
              {selectedItems.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBatchApproval}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('approveSelected')} ({selectedItems.size})
                  </Button>
                </div>
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
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{t('noPendingApprovals')}</p>
              </CardContent>
            </Card>
          ) : (
            pendingApprovals.map(renderApprovalItem)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{t('noApprovedItems')}</p>
              </CardContent>
            </Card>
          ) : (
            approvedItems.map(renderApprovalItem)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>{t('noRejectedItems')}</p>
              </CardContent>
            </Card>
          ) : (
            rejectedItems.map(renderApprovalItem)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalManager;
