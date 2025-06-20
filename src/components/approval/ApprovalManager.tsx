import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileEdit
} from 'lucide-react';
import { useEnhancedApprovalData } from '@/hooks/approval/useEnhancedApprovalData';
import { ApprovalItem, ApprovalFilter } from '@/services/approval/enhancedApprovalService';
import { DataEntryStatus } from '@/types/core/dataEntry';

interface EnhancedApprovalManagerProps {
  initialFilter?: ApprovalFilter;
  className?: string;
}

export const EnhancedApprovalManager: React.FC<EnhancedApprovalManagerProps> = ({
  initialFilter,
  className
}) => {
  const {
    items,
    stats,
    filter,
    isLoading,
    error,
    pendingItems,
    approvedItems,
    rejectedItems,
    draftItems,
    selectedItems,
    setSelectedItems,
    selectAll,
    selectNone,
    isAllSelected,
    loadItems,
    approveItem,
    rejectItem,
    bulkApproval,
    updateFilter,
    resetFilter
  } = useEnhancedApprovalData({
    initialFilter,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'draft'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [bulkReason, setBulkReason] = useState('');
  const [bulkComment, setBulkComment] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateFilter({ searchTerm: term || undefined });
  };

  const handleTabChange = (tab: string) => {
    const tabValue = tab as 'pending' | 'approved' | 'rejected' | 'draft';
    setActiveTab(tabValue);
    updateFilter({ status: tabValue });
    setSelectedItems([]);
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    try {
      await approveItem(item.id);
    } catch (error: any) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (item: ApprovalItem, reason: string) => {
    try {
      await rejectItem(item.id, reason);
    } catch (error: any) {
      console.error('Rejection failed:', error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const params = {
        reason: bulkAction === 'reject' ? bulkReason : undefined,
        comment: bulkComment || undefined
      };

      const result = await bulkApproval(selectedItems, bulkAction, params);
      
      if (result.success) {
        setShowBulkDialog(false);
        setBulkReason('');
        setBulkComment('');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getCurrentTabItems = () => {
    switch (activeTab) {
      case 'pending': return pendingItems;
      case 'approved': return approvedItems;
      case 'rejected': return rejectedItems;
      case 'draft': return draftItems;
      default: return items;
    }
  };

  const currentItems = getCurrentTabItems();

  const getStatusBadge = (status: DataEntryStatus) => {
    switch (status) {
      case DataEntryStatus.PENDING:
        return { variant: 'secondary' as const, icon: Clock, text: 'Gözləyir' };
      case DataEntryStatus.APPROVED:
        return { variant: 'default' as const, icon: CheckCircle, text: 'Təsdiqləndi' };
      case DataEntryStatus.REJECTED:
        return { variant: 'destructive' as const, icon: XCircle, text: 'Rədd edildi' };
      case DataEntryStatus.DRAFT:
        return { variant: 'outline' as const, icon: FileEdit, text: 'Hazırlanır' };
      default:
        return { variant: 'outline' as const, icon: FileEdit, text: 'Naməlum' };
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Məlumatlar yüklənir...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Təsdiq Meneceri</h2>
          <p className="text-muted-foreground">Məktəb məlumatlarını nəzərdən keçirin və təsdiq edin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadItems} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenilə
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filtri sıfırla
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Məktəb və ya kateqoriya axtar..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gözləyən</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Təsdiqlənmiş</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rədd edilmiş</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hazırlanır</CardTitle>
            <FileEdit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{selectedItems.length} element seçildi</span>
                <Button variant="outline" size="sm" onClick={selectNone}>Seçimi ləğv et</Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => { setBulkAction('approve'); setShowBulkDialog(true); }}>
                  <CheckCircle className="h-4 w-4 mr-2" />Təsdiq et
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { setBulkAction('reject'); setShowBulkDialog(true); }}>
                  <XCircle className="h-4 w-4 mr-2" />Rədd et
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Gözləyən ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Təsdiqlənmiş ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rədd edilmiş ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="draft">Hazırlanır ({stats.draft})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {currentItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Heç bir element tapılmadı</p>
                <p className="text-sm text-muted-foreground">Bu statusda məlumat yoxdur</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeTab === 'pending' && currentItems.some(item => item.canApprove) && (
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => checked ? selectAll() : selectNone()}
                  />
                  <span className="text-sm font-medium">Bütün elementləri seç</span>
                </div>
              )}

              {currentItems.map((item) => {
                const statusInfo = getStatusBadge(item.status);
                const Icon = statusInfo.icon;
                const isSelected = selectedItems.includes(item.id);
                
                return (
                  <Card key={item.id} className={isSelected ? 'border-blue-500 bg-blue-50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {activeTab === 'pending' && item.canApprove && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                            />
                          )}
                          <div>
                            <CardTitle className="text-lg">{item.schoolName}</CardTitle>
                            <p className="text-sm text-muted-foreground">Kateqoriya: {item.categoryName}</p>
                            {item.submittedAt && (
                              <p className="text-xs text-muted-foreground">
                                Göndərildi: {new Date(item.submittedAt).toLocaleDateString('az-AZ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant}>
                            <Icon className="mr-1 h-3 w-3" />
                            {statusInfo.text}
                          </Badge>
                          <div className="text-right text-sm">
                            <div className="font-medium">{item.completionRate}% tamamlandı</div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ətraflı bax</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {item.status === DataEntryStatus.REJECTED && item.rejectionReason && (
                      <CardContent className="pt-0 pb-4">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Rədd səbəbi:</strong> {item.rejectionReason}
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    )}
                    
                    {activeTab === 'pending' && item.canApprove && (
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button onClick={() => handleApprove(item)} className="flex-1">
                            <CheckCircle className="mr-2 h-4 w-4" />Təsdiq et
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              const reason = prompt('Rədd səbəbini daxil edin:');
                              if (reason) handleReject(item, reason);
                            }}
                            className="flex-1"
                          >
                            <XCircle className="mr-2 h-4 w-4" />Rədd et
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk dialog */}
      {showBulkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{bulkAction === 'approve' ? 'Toplu Təsdiq' : 'Toplu Rədd'}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedItems.length} element seçildi</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkAction === 'reject' && (
                <div>
                  <label className="text-sm font-medium">Rədd səbəbi *</label>
                  <Input
                    placeholder="Rədd səbəbini daxil edin..."
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Şərh (istəyə bağlı)</label>
                <Input
                  placeholder="Əlavə şərh..."
                  value={bulkComment}
                  onChange={(e) => setBulkComment(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bu əməliyyat {selectedItems.length} elementə tətbiq ediləcək və geri alına bilməz.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkDialog(false);
                    setBulkReason('');
                    setBulkComment('');
                  }}
                  disabled={isBulkProcessing}
                  className="flex-1"
                >
                  Ləğv et
                </Button>
                <Button
                  onClick={handleBulkAction}
                  disabled={isBulkProcessing || (bulkAction === 'reject' && !bulkReason.trim())}
                  className="flex-1"
                >
                  {isBulkProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : bulkAction === 'approve' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {bulkAction === 'approve' ? 'Təsdiq et' : 'Rədd et'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedApprovalManager;