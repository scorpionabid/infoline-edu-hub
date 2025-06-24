import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  User,
  Calendar,
  Info,
  Loader2,
  Eye,
  Download,
  History
} from 'lucide-react';

import { ColumnDataTable } from '@/components/approval/enhanced/ColumnDataTable';
import { useDataReview } from '@/hooks/approval/useDataReview';
import { useTranslation } from '@/contexts/TranslationContext';
import { DataEntryStatus } from '@/types/core/dataEntry';

interface DataReviewDialogProps {
  entryId: string;
  schoolName: string;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (entryId: string, comment?: string) => Promise<void>;
  onReject?: (entryId: string, reason: string, comment?: string) => Promise<void>;
  onDataUpdated?: () => void;
}

export const DataReviewDialog: React.FC<DataReviewDialogProps> = ({
  entryId,
  schoolName,
  categoryName,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDataUpdated
}) => {
  const { t } = useTranslation();
  
  // Data Review Hook
  const {
    entryData,
    validationResults,
    columnData,
    isLoading,
    error,
    hasValidationErrors,
    hasValidationWarnings,
    isDataComplete,
    completionPercentage,
    requiredCompletionPercentage,
    loadEntryData,
    validateEntry,
    refreshData,
    clearError
  } = useDataReview({
    entryId,
    autoLoad: isOpen,
    throttleMs: 2000, // 2 second throttle to reduce API calls
    onError: (error) => console.error('Data review error:', error)
  });

  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'history' | 'actions'>('overview');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen && entryId) {
      loadEntryData(entryId);
      setActionType(null);
      setActionComment('');
      setRejectionReason('');
    }
  }, [isOpen, entryId, loadEntryData]);

  // Handle approve
  const handleApprove = async () => {
    if (!onApprove) return;
    
    setIsSubmitting(true);
    try {
      await onApprove(entryId, actionComment || undefined);
      onDataUpdated?.();
      onClose();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!onReject || !rejectionReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReject(entryId, rejectionReason, actionComment || undefined);
      onDataUpdated?.();
      onClose();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset action type
  const resetAction = () => {
    setActionType(null);
    setActionComment('');
    setRejectionReason('');
  };

  // Status badge component
  const getStatusBadge = (status: DataEntryStatus) => {
    const configs = {
      [DataEntryStatus.PENDING]: { 
        variant: 'secondary' as const, 
        icon: Clock, 
        text: 'Gözləmədə',
        color: 'text-yellow-600'
      },
      [DataEntryStatus.APPROVED]: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        text: 'Təsdiqlənmiş',
        color: 'text-green-600'
      },
      [DataEntryStatus.REJECTED]: { 
        variant: 'destructive' as const, 
        icon: XCircle, 
        text: 'Rədd edilmiş',
        color: 'text-red-600'
      },
      [DataEntryStatus.DRAFT]: { 
        variant: 'outline' as const, 
        icon: FileText, 
        text: 'Layihə',
        color: 'text-gray-600'
      }
    };
    
    const config = configs[status] || configs[DataEntryStatus.DRAFT];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.text}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div>
                <div className="font-bold">{schoolName}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {categoryName}
                </div>
              </div>
            </div>
            {entryData && getStatusBadge(entryData.currentStatus)}
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Məlumatlar yüklənir...</p>
              <p className="text-sm text-muted-foreground">
                Detallı məlumatların əldə edilməsi davam edir
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    clearError();
                    loadEntryData(entryId);
                  }}
                >
                  Yenidən cəhd et
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {entryData && !isLoading && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {entryData.completionStats.filledColumns}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Doldurulmuş / {entryData.completionStats.totalColumns}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {completionPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ümumi tamamlanma
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {requiredCompletionPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Məcburi sahələr
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${hasValidationErrors ? 'text-red-600' : 'text-green-600'}`}>
                    {validationResults.filter(r => r.severity === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Validation xətaları
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validation Alerts */}
            {(hasValidationErrors || hasValidationWarnings) && (
              <Alert variant={hasValidationErrors ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {hasValidationErrors && (
                    <div className="font-medium text-red-600 mb-1">
                      {validationResults.filter(r => r.severity === 'error').length} validation xətası tapıldı
                    </div>
                  )}
                  {hasValidationWarnings && (
                    <div className="font-medium text-yellow-600">
                      {validationResults.filter(r => r.severity === 'warning').length} xəbərdarlıq var
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <Info className="h-4 w-4 mr-2" />
                  Ümumi
                </TabsTrigger>
                <TabsTrigger value="data">
                  <FileText className="h-4 w-4 mr-2" />
                  Məlumatlar
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  Tarixçə
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Əməliyyatlar
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* School Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Məktəb Məlumatları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Məktəb</Label>
                        <p className="text-sm">{entryData.school.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Region</Label>
                        <p className="text-sm">{entryData.school.regionName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Sektor</Label>
                        <p className="text-sm">{entryData.school.sectorName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tamamlanma faizi</Label>
                        <p className="text-sm">{entryData.school.completionRate}%</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Kateqoriya Məlumatları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Ad</Label>
                        <p className="text-sm">{entryData.category.name}</p>
                      </div>
                      {entryData.category.description && (
                        <div>
                          <Label className="text-sm font-medium">Təsvir</Label>
                          <p className="text-sm">{entryData.category.description}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Təyinat</Label>
                        <p className="text-sm">
                          {entryData.category.assignment === 'all' ? 'Bütün istifadəçilər' : 'Yalnız sektorlar'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="outline">{entryData.category.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Submission Info */}
                {entryData.submissionMetadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Təqdim Məlumatları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entryData.submissionMetadata.submittedByName && (
                        <div>
                          <Label className="text-sm font-medium">Təqdim edən</Label>
                          <p className="text-sm">{entryData.submissionMetadata.submittedByName}</p>
                        </div>
                      )}
                      {entryData.submissionMetadata.submittedAt && (
                        <div>
                          <Label className="text-sm font-medium">Təqdim tarixi</Label>
                          <p className="text-sm">
                            {new Date(entryData.submissionMetadata.submittedAt).toLocaleString('az-AZ')}
                          </p>
                        </div>
                      )}
                      {entryData.submissionMetadata.lastModifiedAt && (
                        <div>
                          <Label className="text-sm font-medium">Son dəyişiklik</Label>
                          <p className="text-sm">
                            {new Date(entryData.submissionMetadata.lastModifiedAt).toLocaleString('az-AZ')}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Versiya</Label>
                        <p className="text-sm">v{entryData.submissionMetadata.version}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data">
                <ScrollArea className="h-[400px]">
                  <ColumnDataTable
                    columns={columnData}
                    validationResults={validationResults}
                    showSearch={true}
                    showFilters={true}
                    showValidationSummary={false}
                  />
                </ScrollArea>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <ScrollArea className="h-[400px]">
                  {entryData.statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {entryData.statusHistory.map((entry, index) => (
                        <Card key={entry.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusBadge(entry.status)}
                                <div>
                                  <p className="font-medium">{entry.changedByName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(entry.changedAt).toLocaleString('az-AZ')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {(entry.comment || entry.reason) && (
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                {entry.reason && (
                                  <p className="text-sm"><strong>Səbəb:</strong> {entry.reason}</p>
                                )}
                                {entry.comment && (
                                  <p className="text-sm"><strong>Şərh:</strong> {entry.comment}</p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Tarixçə yoxdur</p>
                      <p className="text-sm text-muted-foreground">
                        Bu entry üçün hələ heç bir status dəyişikliyi olmayıb
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions">
                {actionType ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {actionType === 'approve' ? 'Məlumatları Təsdiqlə' : 'Məlumatları Rədd Et'}
                      </h3>
                      <Button variant="outline" onClick={resetAction}>
                        Ləğv et
                      </Button>
                    </div>
                    
                    {actionType === 'reject' && (
                      <div>
                        <Label htmlFor="rejection-reason">Rədd səbəbi *</Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Məlumatları niyə rədd etdiyinizi izah edin..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="action-comment">
                        Əlavə şərh {actionType === 'approve' ? '(istəyə bağlı)' : '(istəyə bağlı)'}
                      </Label>
                      <Textarea
                        id="action-comment"
                        placeholder="Əlavə şərhlər və ya qeydlər..."
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Bu əməliyyat geri alına bilməz. {actionType === 'approve' ? 'Təsdiq' : 'Rədd'} etdikdən sonra 
                        məktəb admininə avtomatik bildiriş göndəriləcək.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button
                        onClick={actionType === 'approve' ? handleApprove : handleReject}
                        disabled={isSubmitting || (actionType === 'reject' && !rejectionReason.trim())}
                        className="flex-1"
                        variant={actionType === 'approve' ? 'default' : 'destructive'}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : actionType === 'approve' ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {actionType === 'approve' ? 'Təsdiqlə' : 'Rədd et'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Mövcud əməliyyatlar</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Məlumatları nəzərdən keçirdikdən sonra təsdiq və ya rədd edə bilərsiniz
                      </p>
                    </div>

                    {entryData.canApprove && entryData.currentStatus === DataEntryStatus.PENDING && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          size="lg"
                          onClick={() => setActionType('approve')}
                          className="h-20 flex-col"
                          disabled={hasValidationErrors}
                        >
                          <CheckCircle className="h-6 w-6 mb-2" />
                          <div>
                            <div className="font-medium">Təsdiqlə</div>
                            <div className="text-xs opacity-80">Məlumatları qəbul et</div>
                          </div>
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="destructive"
                          onClick={() => setActionType('reject')}
                          className="h-20 flex-col"
                        >
                          <XCircle className="h-6 w-6 mb-2" />
                          <div>
                            <div className="font-medium">Rədd et</div>
                            <div className="text-xs opacity-80">Məlumatları geri göndər</div>
                          </div>
                        </Button>
                      </div>
                    )}

                    {hasValidationErrors && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Validation xətaları mövcuddur. Təsdiq etmədən əvvəl xətaları düzəltmək lazımdır.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!entryData.canApprove && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Bu məlumatları təsdiq etmək və ya rədd etmək üçün icazəniz yoxdur.
                        </AlertDescription>
                      </Alert>
                    )}

                    {entryData.currentStatus !== DataEntryStatus.PENDING && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Bu məlumatlar artıq işlənmişdir. Status: {getStatusBadge(entryData.currentStatus)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {entryData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshData()}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Yenilə
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Bağla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataReviewDialog;