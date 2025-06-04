
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApprovalData } from '@/hooks/approval/useApprovalData';
import { ApprovalTabs } from './ApprovalTabs';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const Approval: React.FC = () => {
  const {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem
  } = useApprovalData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Təsdiq məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gözləyən</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Təsdiqlənmiş</p>
                <p className="text-2xl font-bold">{approvedItems.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rədd edilmiş</p>
                <p className="text-2xl font-bold">{rejectedItems.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Təsdiq İdarəetməsi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Gözləyən
                {pendingApprovals.length > 0 && (
                  <Badge variant="secondary">{pendingApprovals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Təsdiqlənmiş
                {approvedItems.length > 0 && (
                  <Badge variant="secondary">{approvedItems.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rədd edilmiş
                {rejectedItems.length > 0 && (
                  <Badge variant="secondary">{rejectedItems.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <ApprovalTabs
                items={pendingApprovals}
                type="pending"
                onApprove={approveItem}
                onReject={rejectItem}
                onView={viewItem}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              <ApprovalTabs
                items={approvedItems}
                type="approved"
                onView={viewItem}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <ApprovalTabs
                items={rejectedItems}
                type="rejected"
                onView={viewItem}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approval;
