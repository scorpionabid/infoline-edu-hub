
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSectorApprovalData } from '@/hooks/approval/useSectorApprovalData';
import { SectorApprovalItem } from '@/types/sectorData';
import ApprovalDetailDialog from './ApprovalDetailDialog';

const SectorApprovalPanel: React.FC = () => {
  const { t } = useLanguage();
  const {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveSectorItem,
    rejectSectorItem
  } = useSectorApprovalData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SectorApprovalItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const allItems = [...pendingApprovals, ...approvedItems, ...rejectedItems];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {t(status)}
      </Badge>
    );
  };

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.sectorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (itemId: string) => {
    try {
      await approveSectorItem(itemId);
    } catch (error) {
      console.error('Error approving sector item:', error);
    }
  };

  const handleReject = async (itemId: string, reason: string) => {
    try {
      await rejectSectorItem(itemId, reason);
    } catch (error) {
      console.error('Error rejecting sector item:', error);
    }
  };

  const handleViewDetails = (item: SectorApprovalItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('sectorDataApprovals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder={t('searchBySectorOrCategory')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select onValueChange={setSelectedStatus} defaultValue={selectedStatus}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="approved">{t('approved')}</SelectItem>
                  <SelectItem value="rejected">{t('rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalPending')}
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalApproved')}
                  </div>
                  <div className="text-2xl font-bold text-green-600">{approvedItems.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center py-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalRejected')}
                  </div>
                  <div className="text-2xl font-bold text-red-600">{rejectedItems.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t('noSectorApprovalsFound')}</p>
                  </CardContent>
                </Card>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{item.sectorName}</h3>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('category')}: {item.categoryName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.submittedBy}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('completionRate')}: {Math.round(item.completionRate)}%
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                          >
                            {t('viewDetails')}
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(item.id, 'Məlumatlar tələblərə uyğun deyil')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {t('reject')}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(item.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t('approve')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedItem && (
        <ApprovalDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedItem(null);
          }}
          approval={selectedItem}
          onApprove={() => handleApprove(selectedItem.id)}
          onReject={(reason) => handleReject(selectedItem.id, reason)}
        />
      )}
    </div>
  );
};

export default SectorApprovalPanel;
