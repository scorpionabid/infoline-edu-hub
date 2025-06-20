
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Search,
  Filter,
  Loader2,
  AlertCircle 
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useEnhancedApprovalData } from "@/hooks/approval/useEnhancedApprovalData";
import { ApprovalFilter } from "@/services/approval/enhancedApprovalService";
import { DataEntryStatus } from "@/types/core/dataEntry";
import { useToast } from "@/hooks/use-toast";

interface EnhancedApprovalManagerProps {
  initialFilter?: ApprovalFilter;
  className?: string;
}

export const EnhancedApprovalManager: React.FC<EnhancedApprovalManagerProps> = ({
  initialFilter,
  className
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
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
    approveItem,
    rejectItem,
    bulkApproval,
    updateFilter
  } = useEnhancedApprovalData({
    initialFilter,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionItemId, setRejectionItemId] = useState<string | null>(null);

  // Handle individual approval
  const handleApprove = async (itemId: string) => {
    try {
      await approveItem(itemId, "Təsdiqləndi");
      toast({
        title: t("success"),
        description: "Məlumat uğurla təsdiqləndi",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Təsdiq zamanı xəta",
        variant: "destructive"
      });
    }
  };

  // Handle individual rejection
  const handleReject = async (itemId: string, reason: string) => {
    try {
      await rejectItem(itemId, reason, "Rədd edildi");
      toast({
        title: t("success"),
        description: "Məlumat uğurla rədd edildi",
        variant: "default"
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectionItemId(null);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Rədd zamanı xəta",
        variant: "destructive"
      });
    }
  };

  // Handle bulk approval
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: t("warning"),
        description: "Heç bir məlumat seçilməyib",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await bulkApproval(selectedItems, 'approve', {
        comment: "Toplu təsdiq"
      });

      if (result.success) {
        toast({
          title: t("success"),
          description: result.message || "Toplu təsdiq uğurla tamamlandı",
          variant: "default"
        });
      } else {
        toast({
          title: t("error"),
          description: result.error || "Toplu təsdiq zamanı xəta",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Toplu təsdiq zamanı xəta",
        variant: "destructive"
      });
    }
  };

  // Handle bulk rejection
  const handleBulkReject = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: t("warning"),
        description: "Heç bir məlumat seçilməyib",
        variant: "destructive"
      });
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        title: t("warning"),
        description: "Rədd səbəbi göstərilməlidir",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await bulkApproval(selectedItems, 'reject', {
        reason: rejectionReason,
        comment: "Toplu rədd"
      });

      if (result.success) {
        toast({
          title: t("success"),
          description: result.message || "Toplu rədd uğurla tamamlandı",
          variant: "default"
        });
        setRejectionReason("");
      } else {
        toast({
          title: t("error"),
          description: result.error || "Toplu rədd zamanı xəta",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Toplu rədd zamanı xəta",
        variant: "destructive"
      });
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render approval item
  const renderApprovalItem = (item: any) => (
    <Card key={item.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems([...selectedItems, item.id]);
                } else {
                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                }
              }}
              className="h-4 w-4"
              disabled={!item.canApprove}
            />
            <div>
              <CardTitle className="text-lg">{item.schoolName}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.categoryName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              item.status === 'pending' ? 'secondary' :
              item.status === 'approved' ? 'default' :
              item.status === 'rejected' ? 'destructive' : 'outline'
            }>
              {item.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {item.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {item.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {t(`status.${item.status}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Daxil edilmiş sahələr: {item.entryCount || 0}</p>
            <p>Tamamlanma: {item.completionRate}%</p>
            {item.submittedAt && (
              <p>Tarix: {new Date(item.submittedAt).toLocaleDateString('az')}</p>
            )}
          </div>
          {item.canApprove && item.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(item.id)}
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setRejectionItemId(item.id);
                  setShowRejectDialog(true);
                }}
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {t("reject")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">{t("pending")}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t("approved")}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">{t("rejected")}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{t("total")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Bulk Actions */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchSchoolOrCategory")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isAllSelected ? selectNone : selectAll}
                disabled={filteredItems.length === 0}
              >
                {isAllSelected ? "Seçimi ləğv et" : "Hamısını seç"}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectedItems.length === 0 || isLoading}
              >
                {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Toplu təsdiq ({selectedItems.length})
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowRejectDialog(true)}
                disabled={selectedItems.length === 0 || isLoading}
              >
                Toplu rədd ({selectedItems.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Items Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            {t("pending")} ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t("approved")} ({approvedItems.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t("rejected")} ({rejectedItems.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            {t("draft")} ({draftItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>{t("loading")}...</span>
            </div>
          ) : pendingItems.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Təsdiq gözləyən məlumat yoxdur</p>
                <p className="text-muted-foreground">Bütün məlumatlar artıq emal edilib</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingItems
                .filter(item => 
                  item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(renderApprovalItem)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedItems.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium mb-2">Təsdiqlənmiş məlumat yoxdur</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedItems
                .filter(item => 
                  item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(renderApprovalItem)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedItems.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <XCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <p className="text-lg font-medium mb-2">Rədd edilmiş məlumat yoxdur</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedItems
                .filter(item => 
                  item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(renderApprovalItem)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          {draftItems.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <p className="text-lg font-medium mb-2">Draft məlumat yoxdur</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {draftItems
                .filter(item => 
                  item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(renderApprovalItem)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{rejectionItemId ? "Məlumatı rədd et" : "Toplu rədd"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rədd səbəbi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md h-24 resize-none"
                    placeholder="Rədd səbəbini qeyd edin..."
                  />
                </div>
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason("");
                      setRejectionItemId(null);
                    }}
                  >
                    Ləğv et
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (rejectionItemId) {
                        handleReject(rejectionItemId, rejectionReason);
                      } else {
                        handleBulkReject();
                      }
                    }}
                    disabled={!rejectionReason.trim() || isLoading}
                  >
                    {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Rədd et
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedApprovalManager;
