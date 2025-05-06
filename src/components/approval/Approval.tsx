
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useApproval } from '@/hooks/useApproval';
import { DataEntryStatus } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import DataEntryTable from '@/components/dataEntry/DataEntryTable';
import ApprovalDialog from '@/components/approval/ApprovalDialog';

const Approval = () => {
  const { categoryId, schoolId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const {
    loading,
    error,
    data,
    schoolName,
    categoryName,
    handleApprove,
    handleReject
  } = useApproval(schoolId, categoryId);

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Status dəyişkənləri
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Təsdiqləmə prosesi
  const processApprove = async () => {
    setIsProcessing(true);
    try {
      await handleApprove();
      toast({
        title: t('approvalSuccess'),
        description: t('dataApprovedSuccessfully'),
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('approvalError'),
        description: String(err) || t('unknownError'),
      });
    } finally {
      setIsProcessing(false);
      setIsApproveDialogOpen(false);
    }
  };
  
  // Rədd etmə prosesi
  const processReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: t('validationError'),
        description: t('rejectionReasonRequired'),
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await handleReject(rejectionReason);
      toast({
        title: t('rejectionSuccess'),
        description: t('dataRejectedSuccessfully'),
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('rejectionError'),
        description: String(err) || t('unknownError'),
      });
    } finally {
      setIsProcessing(false);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{t('error')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button
            className="mt-4"
            onClick={() => navigate(-1)}
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4 mr-2" />}
          >
            {t('goBack')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noDataFound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('noDataToApprove')}</p>
          <Button
            className="mt-4"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('goBack')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStatus: DataEntryStatus = data.status as DataEntryStatus || 'pending';
  const isApproved = currentStatus === 'approved';
  const isRejected = currentStatus === 'rejected';
  const isPending = currentStatus === 'pending';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('dataApproval')}</h1>
          <p className="text-sm text-muted-foreground">
            {schoolName} - {categoryName}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>{t('reviewData')}</CardTitle>
            <Badge variant={isApproved ? 'success' : isRejected ? 'destructive' : 'outline'}>
              {isApproved 
                ? <><CheckCircle className="h-3 w-3 mr-1" /> {t('approved')}</> 
                : isRejected 
                  ? <><XCircle className="h-3 w-3 mr-1" /> {t('rejected')}</>
                  : t('pending')
              }
            </Badge>
          </div>
          <CardDescription>
            {t('reviewCategoryData', { category: categoryName, school: schoolName })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <DataEntryTable entries={data.entries} />
          </ScrollArea>
        </CardContent>
      </Card>
      
      {isPending && (
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={() => setIsRejectDialogOpen(true)}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t('reject')}
          </Button>
          <Button 
            onClick={() => setIsApproveDialogOpen(true)}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('approve')}
          </Button>
        </div>
      )}
      
      <ApprovalDialog 
        type="approve"
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onConfirm={processApprove}
        isLoading={isProcessing}
        title={t('approveData')}
        description={t('approveDataConfirmation')}
        entity={categoryName}
        school={schoolName}
      />
      
      <ApprovalDialog
        type="reject"
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={processReject}
        isLoading={isProcessing}
        title={t('rejectData')}
        description={t('rejectDataConfirmation')}
        entity={categoryName}
        school={schoolName}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
      />
    </div>
  );
};

export default Approval;
