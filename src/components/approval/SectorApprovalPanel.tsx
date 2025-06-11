
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorApprovalData } from '@/hooks/approval/useSectorApprovalData';
import { SectorApprovalItem } from '@/types/sectorData';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const SectorApprovalPanel: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem
  } = useSectorApprovalData();

  const [selectedItem, setSelectedItem] = useState<SectorApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = async (item: SectorApprovalItem) => {
    try {
      await approveItem(item.id);
      toast({
        title: t('success') || 'Müvəffəqiyyət',
        description: t('itemApproved') || 'Element təsdiqləndi'
      });
    } catch (error) {
      toast({
        title: t('error') || 'Xəta',
        description: t('approveError') || 'Təsdiqləmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;
    
    try {
      await rejectItem(selectedItem.id, rejectionReason);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedItem(null);
      toast({
        title: t('success') || 'Müvəffəqiyyət',
        description: t('itemRejected') || 'Element rədd edildi'
      });
    } catch (error) {
      toast({
        title: t('error') || 'Xəta',
        description: t('rejectError') || 'Rədd etmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };

  const openRejectDialog = (item: SectorApprovalItem) => {
    setSelectedItem(item);
    setIsRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Gözləyir</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Təsdiqləndi</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><AlertTriangle className="w-3 h-3 mr-1" />Rədd edildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderApprovalTable = (items: SectorApprovalItem[], title: string, showActions = false) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Heç bir element tapılmadı</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sektor</TableHead>
                <TableHead>Kateqoriya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Göndərilmə tarixi</TableHead>
                <TableHead>Tamamlanma</TableHead>
                {showActions && <TableHead>Əməliyyatlar</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sectorName}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{new Date(item.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.completionRate}%</span>
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewItem(item)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Bax
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(item)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Təsdiqlə
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectDialog(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Rədd et
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-8 h-8 animate-spin mr-2" />
        Yüklənir...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Sektor məlumatlarının təsdiqlənməsi sektor administratorları tərəfindən həyata keçirilir.
        </AlertDescription>
      </Alert>

      {renderApprovalTable(pendingApprovals, 'Təsdiq Gözləyən Məlumatlar', true)}
      {renderApprovalTable(approvedItems, 'Təsdiqlənmiş Məlumatlar')}
      {renderApprovalTable(rejectedItems, 'Rədd Edilmiş Məlumatlar')}

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məlumatları Rədd Et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rədd Etmə Səbəbi</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Rədd etmə səbəbini yazın..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Ləğv et
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                variant="destructive"
              >
                Rədd et
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectorApprovalPanel;
