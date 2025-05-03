
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalData } from '@/hooks/approval/useApprovalData';
import { DataEntryStatus } from '@/types/dataEntry';

export const Approval: React.FC = () => {
  const { t } = useLanguage();
  const { data, loading, error, loadData, approveItem, rejectItem } = useApprovalData();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadData('pending');
  }, [loadData]);

  // Tab dəyişdikdə məlumatları yenilə
  const handleTabChange = async (value: string) => {
    setActiveTab(value as 'pending' | 'approved' | 'rejected');
    try {
      await loadData(value as 'pending' | 'approved' | 'rejected');
    } catch (err) {
      console.error('Error loading data for tab', value, err);
      toast.error(t('errorLoadingTabData'));
    }
  };

  // Təsdiq etmək üçün
  const handleApprove = async (id: string) => {
    setSelectedItemId(id);
    setProcessingAction(true);
    try {
      const success = await approveItem(id);
      if (success) {
        toast.success(t('itemApproved'));
        await loadData(activeTab);
      }
    } catch (err) {
      console.error('Error approving item:', err);
      toast.error(t('approvalError'));
    } finally {
      setProcessingAction(false);
      setSelectedItemId(null);
    }
  };

  // Rədd etməyi açmaq üçün
  const handleOpenReject = (id: string) => {
    setSelectedItemId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  // Rədd etmək üçün
  const handleReject = async () => {
    if (!selectedItemId || !rejectReason.trim()) {
      toast.error(t('rejectionReasonRequired'));
      return;
    }
    
    setProcessingAction(true);
    try {
      const success = await rejectItem(selectedItemId, rejectReason);
      if (success) {
        toast.success(t('itemRejected'));
        setRejectDialogOpen(false);
        await loadData(activeTab);
      }
    } catch (err) {
      console.error('Error rejecting item:', err);
      toast.error(t('rejectionError'));
    } finally {
      setProcessingAction(false);
    }
  };

  // Cədvəl sütunları
  const columns = [
    {
      accessorKey: 'categoryName',
      header: t('category')
    },
    {
      accessorKey: 'columnName',
      header: t('field')
    },
    {
      accessorKey: 'schoolName',
      header: t('school')
    },
    {
      accessorKey: 'sectorName',
      header: t('sector')
    },
    {
      accessorKey: 'value',
      header: t('value'),
      cell: ({ row }: { row: any }) => <div className="max-w-[200px] truncate">{row.getValue('value')}</div>
    },
    {
      accessorKey: 'submittedDate',
      header: t('submittedDate')
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('status');
        return (
          <Badge className={
            status === 'pending' ? 'bg-yellow-500' :
            status === 'approved' ? 'bg-green-500' : 'bg-red-500'
          }>
            {status === 'pending' ? t('pending') : 
             status === 'approved' ? t('approved') : t('rejected')}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: ({ row }: { row: any }) => {
        const id = row.original.id;
        const isProcessing = processingAction && selectedItemId === id;
        
        // Yalnız 'pending' statusunda olan elementlər üçün düymələri göstər
        if (activeTab !== 'pending') return null;
        
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600 border-green-600 hover:bg-green-50"
              disabled={isProcessing}
              onClick={() => handleApprove(id)}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              {t('approve')}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={isProcessing}
              onClick={() => handleOpenReject(id)}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
              {t('reject')}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading={t("approvalPage")}
        subheading={t("approvalPageDescription")}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="pending">{t("pendingApprovals")}</TabsTrigger>
          <TabsTrigger value="approved">{t("approvedEntries")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("rejectedEntries")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingApprovals")}</CardTitle>
              <CardDescription>{t("pendingApprovalsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  {t("errorLoadingData")}
                  <p className="text-sm">{error.message}</p>
                </div>
              ) : data && data.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={data}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {t("noPendingApprovals")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("approvedEntries")}</CardTitle>
              <CardDescription>{t("approvedEntriesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  {t("errorLoadingData")}
                </div>
              ) : data && data.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={data}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {t("noApprovedEntries")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("rejectedEntries")}</CardTitle>
              <CardDescription>{t("rejectedEntriesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  {t("errorLoadingData")}
                </div>
              ) : data && data.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={data}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {t("noRejectedEntries")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rədd etmə dialoqu */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectEntryTitle')}</DialogTitle>
            <DialogDescription>{t('rejectEntryDescription')}</DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder={t('rejectReasonPlaceholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processingAction}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processingAction || !rejectReason.trim()}>
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('rejecting')}
                </>
              ) : t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approval;
