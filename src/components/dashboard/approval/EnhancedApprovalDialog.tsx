
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';

interface EnhancedApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName?: string;
  categoryName?: string;
  data?: any[];
  isProcessing?: boolean;
  currentStatus?: string;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  open,
  onOpenChange,
  schoolName,
  categoryName,
  data,
  isProcessing = false,
  currentStatus,
  onApprove,
  onReject,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'review'>('data');
  
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove();
    } catch (error) {
      console.error('Təsdiq xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!reason.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onReject(reason);
    } catch (error) {
      console.error('Rədd xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Təqdim olunan Məlumatlar</span>
            {currentStatus && (
              <Badge variant={currentStatus === 'approved' ? 'success' : currentStatus === 'rejected' ? 'destructive' : 'secondary'}>
                {currentStatus === 'approved' ? 'Təsdiqlənib' : currentStatus === 'rejected' ? 'Rədd edilib' : 'Gözləmədə'}
              </Badge>
            )}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            <div><strong>Məktəb:</strong> {schoolName}</div>
            <div><strong>Kateqoriya:</strong> {categoryName}</div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'data' | 'review')} className="mt-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="data">Məlumatlar</TabsTrigger>
            <TabsTrigger value="review">Baxış və Təsdiq</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="mt-4">
            {!data || data.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p>Məlumat tapılmadı</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sahə</TableHead>
                      <TableHead>Dəyər</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.label || item.columnName}</TableCell>
                        <TableCell>{item.value || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="review" className="mt-4 space-y-4">
            {currentStatus !== 'approved' && currentStatus !== 'rejected' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reason">İmtina səbəbi (Rədd etdikdə məcburidir)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="İmtina səbəbini daxil edin..."
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="success"
                    disabled={isSubmitting || isProcessing}
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Təsdiqlə
                  </Button>
                  
                  <Button
                    variant="destructive"
                    disabled={isSubmitting || isProcessing || !reason.trim()}
                    onClick={handleReject}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Rədd Et
                  </Button>
                </div>
              </>
            )}
            
            {currentStatus === 'approved' && (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg font-medium">Bu məlumatlar artıq təsdiqlənib</p>
              </div>
            )}
            
            {currentStatus === 'rejected' && (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <p className="text-lg font-medium">Bu məlumatlar rədd edilib</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bağla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
